import React from "react";
import { WorkRequestProfile_Get } from "@graphql";
import { ErrorCard, Spinner } from "@components";
import { WorkRequestProfile, WorkRequestProfileProps } from "./WorkRequestProfile";

type Props = WorkRequestProfileProps & {
  id: string;
};

export class WorkRequestProfileQuery extends React.Component<Props> {
  /**
   * A hack that prevents react-apollo from killing the page
   * see https://github.com/apollographql/react-apollo/issues/1314
   */
  data: WorkRequestProfile_Get.Return["workRequestById"];

  render() {
    return (
      <WorkRequestProfile_Get.Component
        variables={{ id: this.props.id }}
        fetchPolicy="network-only"
      >
        {({ data, loading, error }) => {
          if (loading) {
            return <Spinner />;
          }

          if (error) {
            return (
              <ErrorCard title="Cannot open workrequest" message={error.toString()} />
            );
          }

          if (data.workRequestById) {
            this.data = data.workRequestById;
          }

          return <WorkRequestProfile data={this.data} {...this.props} />;
        }}
      </WorkRequestProfile_Get.Component>
    );
  }
}
