import React, { useState } from "react";
import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import locale from "@locale";
import { ThemeType } from "@theme";
import { Tabs } from "@components/Tabs";
import { ErrorBoundary, withErrorBoundary } from "@components/ErrorBoundary";

type Props = {
  id: string;
  dupeTab: () => React.ReactNode;
  periods: React.ReactNode;
  card: React.ReactNode;
  documentsTab: () => React.ReactNode;
  topBar: React.ReactNode;
  eventLog: React.ReactNode;
  renderInfo: () => React.ReactNode;
  renderBookings: () => React.ReactNode;
};

export function WorkRequestProfileLayout(props: Props) {
  const [tab, setTab] = useState<string>("documents");
  const [secondaryTab, setSecondaryTab] = useState<string>("info");

  const classes = useStyles({});
  const cardRef = React.createRef<HTMLDivElement>();

  const { id, periods, card, topBar, documentsTab, dupeTab } = props;

  const tabs = [
    {
      fitted: true,
      label: locale.Files,
      value: "documents",
      content: withErrorBoundary(documentsTab())
    },
    {
      label: locale.Duplicates,
      value: "duplicates",
      content: withErrorBoundary(dupeTab())
    }
  ];

  return (
    <div>
      <Grid
        container
        spacing={2}
        className={classes.root}
        data-test="WorkRequestProfileLayout"
        data-test-id={id}
      >
        <Grid item xs={12}>
          {withErrorBoundary(topBar)}
        </Grid>

        <Grid item xs={12}>
          <div ref={cardRef}>{withErrorBoundary(card)}</div>
        </Grid>

        <Grid item xs={12}>
          {withErrorBoundary(periods)}
        </Grid>

        <Grid item xs={12} lg={5} style={{ maxHeight: 600 }}>
          {withErrorBoundary(props.eventLog)}
        </Grid>

        <Grid item xs={12} lg={7} style={{ maxHeight: 600 }}>
          <Tabs
            tabs={[
              {
                label: "Information",
                value: "info",
                content: () => withErrorBoundary(props.renderInfo()),
                fitted: true
              },
              {
                label: "Bokningar",
                value: "bookings",
                content: () => withErrorBoundary(props.renderBookings()),
                fitted: true
              }
            ]}
            value={secondaryTab}
            ContentProps={{
              style: {
                height: "100%",
                minHeight: 340,
                maxHeight: 520,
                overflow: "auto"
              }
            }}
            PaperProps={{ style: { height: "100%" } }}
            onChange={(e, v) => setSecondaryTab(v)}
            TabsProps={{ indicatorColor: "primary" }}
            AppBarProps={{ style: { borderTopRightRadius: 4, borderTopLeftRadius: 4 } }}
            withHref={false}
          />
        </Grid>

        <Grid item xs={12}>
          <Tabs
            tabs={tabs}
            TabsProps={{
              indicatorColor: "primary"
            }}
            value={tab}
            AppBarProps={{
              style: { borderTopRightRadius: 4, borderTopLeftRadius: 4 }
            }}
            id="workrequest_profile_tabs"
            onChange={(e, v) => setTab(v)}
          />
        </Grid>
      </Grid>
    </div>
  );
}

const useStyles = makeStyles((theme: ThemeType) => ({
  root: {
    padding: theme.spacing(2),
    marginTop: -16
  },

  spacing: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },

  spacingTop: {
    marginBottom: theme.spacing(2)
  },

  pushUp: {
    marginTop: "-50%"
  },

  cardOut: { top: "-999px !important" }
}));

export default WorkRequestProfileLayout;
