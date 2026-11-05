"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { Observer } from "gsap/Observer";

type CarouselControls = { step: (direction: number) => void; to: (index: number) => void };

export function useInfiniteLabCarousel(
  root: RefObject<HTMLDivElement | null>,
  slugs: string[],
  onChange: (index: number) => void,
) {
  const controls = useRef<CarouselControls | null>(null);
  const dragged = useRef(false);
  const changeRef = useRef(onChange);
  useLayoutEffect(() => { changeRef.current = onChange; });

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    gsap.registerPlugin(Draggable, Observer);
    const cards = Array.from(element.querySelectorAll<HTMLElement>("[data-lab-card]"));
    const count = cards.length;
    const linked = slugs.indexOf(window.location.hash.slice(1));
    const position = { value: linked >= 0 ? linked : 1 };
    const wrap = gsap.utils.wrap(0, count);
    const relative = gsap.utils.wrap(-count / 2, count / 2);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let step = 350;
    let width = 300;
    let height = 430;
    let last = -1;
    let target = position.value;
    let tween: gsap.core.Tween | undefined;
    let settle: gsap.core.Tween | undefined;
    const hoverAnimations = new Map<HTMLElement, gsap.core.Tween>();
    const highlight = (index: number | null) => {
      cards.forEach((card, i) => {
        card.classList.toggle("is-hovered", i === index);
        card.classList.toggle("is-muted", index !== null && i !== index);
        hoverAnimations.get(card)?.kill();
        hoverAnimations.set(card, gsap.to(card, {
          scale: i === index && !preference.matches ? 1.075 : 1,
          duration: preference.matches ? 0 : 0.28,
          ease: "power2.out",
        }));
      });
    };
    const hoverCleanups = cards.map((card, index) => {
      const enter = () => {
        if (window.matchMedia("(hover: hover)").matches && !element.classList.contains("is-dragging")) highlight(index);
      };
      const focus = () => { if (card.matches(":focus-visible")) highlight(index); };
      const leave = () => highlight(null);
      card.addEventListener("pointerenter", enter);
      card.addEventListener("pointerleave", leave);
      card.addEventListener("focus", focus);
      card.addEventListener("blur", leave);
      return () => {
        card.removeEventListener("pointerenter", enter);
        card.removeEventListener("pointerleave", leave);
        card.removeEventListener("focus", focus);
        card.removeEventListener("blur", leave);
        card.classList.remove("is-hovered", "is-muted");
      };
    });

    const render = () => {
      cards.forEach((card, index) => {
        const distance = relative(index - position.value);
        const near = Math.abs(distance);
        gsap.set(card, {
          x: distance * step - width / 2,
          y: -height / 2 + (preference.matches ? 0 : Math.min(near * 9, 22)),
          rotation: preference.matches ? 0 : gsap.utils.clamp(-3, 3, distance * 2),
          autoAlpha: near * step < element.clientWidth / 2 + width ? 1 : 0,
          zIndex: Math.round(100 - near * 10),
        });
      });
      const active = wrap(Math.round(position.value));
      if (active !== last) {
        last = active;
        changeRef.current(active);
      }
    };
    const measure = () => {
      width = cards[0].offsetWidth;
      height = cards[0].offsetHeight;
      step = width + (element.clientWidth < 700 ? 24 : 46);
      render();
    };
    const go = (next: number) => {
      target = Math.round(next);
      tween?.kill();
      tween = gsap.to(position, {
        value: target,
        duration: preference.matches ? 0 : 0.55,
        ease: "power3.out",
        onUpdate: render,
        onComplete: () => {
          // Keep values bounded without moving any rendered card.
          position.value = wrap(position.value);
          target = position.value;
          render();
        },
      });
    };
    controls.current = {
      step: (direction) => { settle?.kill(); go(target + direction); },
      to: (index) => { settle?.kill(); go(position.value + relative(index - position.value)); },
    };
    const proxy = document.createElement("div");
    let start = position.value;
    let startX = 0;
    let previousX = 0;
    let previousTime = 0;
    let velocity = 0;
    const context = gsap.context(() => {
      measure();
    }, element);
    const drag = Draggable.create(proxy, {
      trigger: element,
      type: "x",
      dragClickables: true,
      minimumMovement: 6,
      allowNativeTouchScrolling: true,
      onPress(this: Draggable) {
        tween?.kill();
        settle?.kill();
        dragged.current = false;
        start = position.value;
        startX = previousX = this.x;
        previousTime = performance.now();
        velocity = 0;
      },
      onDragStart() { highlight(null); dragged.current = true; element.classList.add("is-dragging"); },
      onDrag(this: Draggable) {
        const now = performance.now();
        velocity = (this.x - previousX) / Math.max(1, now - previousTime);
        previousX = this.x;
        previousTime = now;
        position.value = start - (this.x - startX) / step;
        render();
      },
      onRelease() {
        element.classList.remove("is-dragging");
        if (dragged.current) {
          const momentum = performance.now() - previousTime < 100
            ? gsap.utils.clamp(-1.5, 1.5, -velocity * 160 / step) : 0;
          go(position.value + momentum);
        }
      },
    })[0];
    const wheel = Observer.create({
      target: element,
      type: "wheel",
      preventDefault: true,
      onChange(self) {
        tween?.kill();
        settle?.kill();
        position.value += gsap.utils.clamp(-1.25, 1.25,
          (Math.abs(self.deltaX) > Math.abs(self.deltaY) ? self.deltaX : self.deltaY) / 420);
        target = position.value;
        render();
        settle = gsap.delayedCall(0.16, () => go(position.value));
      },
    });
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    const motionChange = () => { highlight(null); measure(); };
    preference.addEventListener("change", motionChange);
    const hashChange = () => {
      const index = slugs.indexOf(window.location.hash.slice(1));
      if (index >= 0) controls.current?.to(index);
    };
    window.addEventListener("hashchange", hashChange);
    return () => {
      resize.disconnect();
      preference.removeEventListener("change", motionChange);
      window.removeEventListener("hashchange", hashChange);
      tween?.kill();
      settle?.kill();
      hoverCleanups.forEach((cleanup) => cleanup());
      hoverAnimations.forEach((animation) => animation.kill());
      drag.kill();
      wheel.kill();
      context.revert();
      gsap.set(cards, { clearProps: "transform,opacity,visibility,zIndex" });
      controls.current = null;
    };
  }, [root, slugs]);
  return { controls, dragged };
}
