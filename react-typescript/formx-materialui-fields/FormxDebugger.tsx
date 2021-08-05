import React from "react";
import cns from "classnames";
import { Observer } from "mobx-react";
import { Collapse, Paper, withStyles } from "@material-ui/core";
import { ArrowCollapse } from "mdi-material-ui";
import { FormStore } from "@modules/formx";
import { FormContext } from "@modules/formx-react/FormContext";
import { Classes, ThemeType } from "@theme";

type Props = {
  classes?: Classes<typeof styles>;
  store?: FormStore<any>;
};

type State = {
  isCollapsed: boolean;
};

/**
 * Outputs formx form state for debugging purposes
 * Either in development or when localStorage.debugForms is truthy
 */
class FormxDebuggerCmp extends React.Component<Props, State> {
  static contextType = FormContext;

  state: State = { isCollapsed: true };

  toggle = () => this.setState({ isCollapsed: !this.state.isCollapsed });

  render() {
    const { classes } = this.props;

    const store = this.props.store || this.context.store;

    if (!store) {
      throw new Error("cannot find store in props or context");
    }

    const shouldRender =
      (process.env.NODE_ENV !== "production" && !window["Cypress"]) ||
      (typeof localStorage !== "undefined" && localStorage.getItem("debugFormx"));

    if (!shouldRender) {
      return null;
    }

    return (
      <Observer>
        {() => (
          <div
            className={cns(classes.root, {
              [classes.rootCollapsed]: this.state.isCollapsed
            })}
          >
            <div className={classes.toggleIcon}>
              <ArrowCollapse onClick={this.toggle} />
            </div>

            <Collapse in={!this.state.isCollapsed}>
              <Paper style={{ padding: 16 }}>
                <pre style={{ margin: 0 }}>{JSON.stringify(store.state, null, 4)}</pre>
              </Paper>
            </Collapse>
          </div>
        )}
      </Observer>
    );
  }
}

const styles = (theme: ThemeType) => ({
  root: {
    position: "fixed",
    top: 0,
    bottom: 0,
    right: 0,
    width: "30rem",
    margin: 4,
    zIndex: 99999,
    overflowY: "auto"
  },

  rootCollapsed: {
    width: "4rem",
    height: "4rem"
  },

  toggleIcon: {
    position: "absolute",
    right: 0,
    top: 0
  }
});

export const FormxDebugger = withStyles(styles as any)(FormxDebuggerCmp);
