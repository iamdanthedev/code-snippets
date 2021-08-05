import React from "react";
import { isEmpty, toSafeInteger } from "lodash";
import locale from "@locale";
import {
  Grid,
  Paper,
  Typography,
  makeStyles,
  TextField,
  InputAdornment
} from "@material-ui/core";
import { ArrowUpward, ArrowDownward, Lock } from "@material-ui/icons";
import { useObserver } from "mobx-react-lite";
import { RegularButton, PrimaryButton, SpinnerOverlay, Body } from "@components";
import { WorkRequestProfileStore } from "../WorkRequestProfileStore";

type Props = {
  store: WorkRequestProfileStore;
};

export const VacanciesUpdater = React.memo((props: Props) => {
  const { store } = props;
  const classes = useStyles({});

  return useObserver(() => {
    if (isEmpty(store.selectedWeeksCells)) {
      return null;
    }

    return (
      <Grid container spacing={2} alignItems={"flex-end"} style={{ marginTop: 4 }}>
        <SpinnerOverlay show={store.isLoadingVacancies} />

        <Grid item xs={3}>
          <Paper className={classes.paperRoot} elevation={0}>
            <div style={{}}>
              <Body>Lägg till behov</Body>
            </div>

            <div style={{ marginLeft: 8 }}>
              <PrimaryButton
                size={"small"}
                className={classes.arrowBtn}
                leftIcon={<ArrowUpward />}
                onClick={() => store.increaseVacancies()}
              />
            </div>
          </Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper className={classes.paperRoot} elevation={0}>
            <div style={{}}>
              <Body>Minska behov</Body>
            </div>

            <div style={{ marginLeft: 8 }}>
              <PrimaryButton
                size={"small"}
                className={classes.arrowBtn}
                leftIcon={<ArrowDownward />}
                onClick={() => store.decreaseVacancies()}
              />
            </div>
          </Paper>
        </Grid>

        <Grid item xs={4}>
          <RegularButton
            size={"large"}
            leftIcon={<Lock />}
            onClick={() => store.disabledVacancies()}
          >
            {locale.DisableWeek}
          </RegularButton>
        </Grid>
      </Grid>
    );
  });
});

const useStyles = makeStyles(() => ({
  paperRoot: {
    display: "flex",
    alignItems: "center"
  },
  startAdornmentText: {
    padding: "0 10px 0 5px"
  },
  arrowBtn: {
    marginBottom: "5px",
    marginLeft: "5px"
  }
}));
