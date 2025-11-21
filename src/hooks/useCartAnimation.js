import { useCallback } from "react";

/**
 * Custom hook for animating items flying to cart
 * @param {Function} onComplete - Callback when animation completes
 */
export const useCartAnimation = (onComplete) => {
  const animateToCart = useCallback(
    (sourceElement) => {
      if (!sourceElement) return;

      // Get cart icon position
      const cartIcon = document.querySelector("[data-cart-icon]");
      if (!cartIcon) {
        console.warn("Cart icon not found");
        if (onComplete) onComplete();
        return;
      }

      // Get source element position
      const sourceRect = sourceElement.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      // Calculate the bezier curve control points for smooth arc
      const startX = sourceRect.left + sourceRect.width / 2;
      const startY = sourceRect.top + sourceRect.height / 2;
      const endX = cartRect.left + cartRect.width / 2;
      const endY = cartRect.top + cartRect.height / 2;

      // Control point for the arc (creates upward curve)
      const controlX = startX + (endX - startX) / 2;
      const controlY = Math.min(startY, endY) - 100; // Arc upward

      // Create flying image clone
      const flyingImg = sourceElement.cloneNode(true);
      flyingImg.style.cssText = `
      position: fixed;
      top: ${startY - sourceRect.height / 2}px;
      left: ${startX - sourceRect.width / 2}px;
      width: ${Math.min(sourceRect.width, 80)}px;
      height: ${Math.min(sourceRect.height, 80)}px;
      z-index: 9999;
      pointer-events: none;
      border-radius: 8px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.3);
      object-fit: cover;
      transition: none;
    `;

      document.body.appendChild(flyingImg);

      // Animate using keyframes for better control
      const animation = flyingImg.animate(
        [
          {
            transform: "translate(0, 0) scale(1) rotate(0deg)",
            opacity: 1,
            offset: 0,
          },
          {
            transform: `translate(${(controlX - startX) * 0.5}px, ${
              (controlY - startY) * 0.5
            }px) scale(0.7) rotate(180deg)`,
            opacity: 0.9,
            offset: 0.3,
          },
          {
            transform: `translate(${controlX - startX}px, ${
              controlY - startY
            }px) scale(0.5) rotate(270deg)`,
            opacity: 0.8,
            offset: 0.5,
          },
          {
            transform: `translate(${endX - startX}px, ${
              endY - startY
            }px) scale(0.1) rotate(360deg)`,
            opacity: 0,
            offset: 1,
          },
        ],
        {
          duration: 1200,
          easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
          fill: "forwards",
        }
      );

      // Animate cart icon with professional bounce
      cartIcon.classList.add("cart-bounce");

      // Cleanup after animation
      animation.onfinish = () => {
        flyingImg.remove();
        cartIcon.classList.remove("cart-bounce");
        if (onComplete) onComplete();
      };
    },
    [onComplete]
  );

  return { animateToCart };
};
