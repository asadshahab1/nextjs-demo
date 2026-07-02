"use client";

// CLIENT COMPONENT: the cart lives entirely in client state. No SEO relevance,
// pure interactivity -> CSR is the right call. Clicking +/- updates local
// state instantly (the "+ button" pattern: re-render in the browser, no server
// round-trip and no page regeneration). Persistence to the server happens
// separately via a Server Action at checkout.

import { createContext, useContext, useReducer, ReactNode } from "react";

export type CartLine = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  quantity: number;
};

type State = { lines: CartLine[] };
type Action =
  | { type: "add"; line: Omit<CartLine, "quantity">; quantity: number }
  | { type: "setQty"; id: string; quantity: number }
  | { type: "remove"; id: string }
  | { type: "clear" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add": {
      const existing = state.lines.find((l) => l.id === action.line.id);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.id === action.line.id ? { ...l, quantity: l.quantity + action.quantity } : l
          ),
        };
      }
      return { lines: [...state.lines, { ...action.line, quantity: action.quantity }] };
    }
    case "setQty":
      return {
        lines: state.lines
          .map((l) => (l.id === action.id ? { ...l, quantity: Math.max(0, action.quantity) } : l))
          .filter((l) => l.quantity > 0),
      };
    case "remove":
      return { lines: state.lines.filter((l) => l.id !== action.id) };
    case "clear":
      return { lines: [] };
  }
}

const CartContext = createContext<{
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">, quantity: number) => void;
  setQty: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  totalCents: number;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] });
  const count = state.lines.reduce((n, l) => n + l.quantity, 0);
  const totalCents = state.lines.reduce((n, l) => n + l.priceCents * l.quantity, 0);
  return (
    <CartContext.Provider
      value={{
        lines: state.lines,
        add: (line, quantity) => dispatch({ type: "add", line, quantity }),
        setQty: (id, quantity) => dispatch({ type: "setQty", id, quantity }),
        remove: (id) => dispatch({ type: "remove", id }),
        clear: () => dispatch({ type: "clear" }),
        count,
        totalCents,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
