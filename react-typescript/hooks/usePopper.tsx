import React from "react";
import { ClickAwayListener, Popper } from "@material-ui/core";

export function usePopper(
  getAnchorEl: () => HTMLElement,
  initialOpen = false,
  content: (props: { closePopper: () => void }) => React.ReactNode
) {
  const [open, setOpen] = React.useState(initialOpen);

  const anchorEl = getAnchorEl();

  const popper = anchorEl ? (
    <Popper
      open={open}
      anchorEl={getAnchorEl}
      style={{ zIndex: 9999 }}
      placement="bottom-start"
      modifiers={{
        offset: { enabled: true, offset: "0 5" }
      }}
    >
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        {content({ closePopper: () => setOpen(false) })}
      </ClickAwayListener>
    </Popper>
  ) : null;

  return {
    popper,
    setPopperOpen: setOpen,
    togglePopper: () => setOpen(!open)
  };
}
