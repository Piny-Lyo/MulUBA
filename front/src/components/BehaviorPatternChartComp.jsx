import React from 'react';
import { connect } from "react-redux";
import { Card } from 'antd';
import Chart from '../views/behavior-pattern-chart';
import './view-comp-style.less';
import _ from 'lodash';

class View extends React.PureComponent {

  componentDidMount() {
    Chart.init(this.container);
  }

  componentDidUpdate(prevProps) {
    const { userID, dayTime, hourBehaviors, minBehaviorsOfHour, userMinBehaviors, dispatch } = this.props;
    if (userID !== null && dayTime !== null && Object.keys(hourBehaviors).length > 0) {
      // 只有在点击了不同的星期后才更新小时时间轴
      if (!_.isEqual(prevProps.hourBehaviors, hourBehaviors)) {
        Chart.updateHour(userID, dayTime, hourBehaviors, dispatch);
      }
    }
    if (userID !== null && dayTime !== null && Object.keys(minBehaviorsOfHour).length > 0 && userMinBehaviors.length > 0) {
      Chart.updateMin(userID, dayTime, minBehaviorsOfHour, userMinBehaviors, dispatch);
    }
  }

  render() {
    return (
      <Card className="view view-e" title="Behavior Pattern View">
        <div className="view-container" ref={ ref => this.container = ref }></div>
        <div className="tooltip"></div>
      </Card>
    );
  }
}

const mapStateToProps = (state, props) => ({
  userID: state.userID,
  dayTime: state.dayTime,
  hourBehaviors: state.hourBehaviors,
  minBehaviorsOfHour: state.minBehaviorsOfHour,
  userMinBehaviors: state.userMinBehaviors
});

const mapDispatchToProps = dispatch => ({
  dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(View);