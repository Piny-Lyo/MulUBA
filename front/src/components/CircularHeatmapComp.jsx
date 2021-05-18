import React from 'react';
import { connect } from "react-redux";
import { Card } from 'antd';
import Chart from '../views/circular-heatmap';
import './view-comp-style.less';


class View extends React.PureComponent {

  componentDidMount() {
    Chart.init(this.container, this.props.userBehaviors);
  }

  componentDidUpdate(prevProps, prevState) {
    if (Object.keys(this.props.userBehaviors).length > 0 && this.props.userID !== null) {
      Chart.update(this.props.userBehaviors, this.props.userID, this.props.dispatch);
    }
  }

  render() {
    return (
      <Card className="view view-d" title="Cycle Behavior View">
        <div className="view-container" ref={ ref => this.container = ref }></div>
        <div className="tooltip"></div>
      </Card>
    );
  }
}

const mapStateToProps = (state, props) => ({
  userBehaviors: state.userBehaviors,
  userID: state.userID
});

const mapDispatchToProps = dispatch => ({
  dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(View);