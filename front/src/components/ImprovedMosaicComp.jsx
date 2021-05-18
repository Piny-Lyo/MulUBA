import React from 'react';
import { connect } from "react-redux";
import { Card } from 'antd';
import Chart from '../views/improved-mosaic-plot';
import './view-comp-style.less';

class View extends React.PureComponent {

  componentDidMount() {
    Chart.init(this.container);
  }

  componentDidUpdate() {
    Chart.update(this.props.users, this.props.dispatch);
  }

  render() {
    return (
      <Card className="view view-c" title="User Profile View">
        <div className="view-container" ref={ ref => this.container = ref }></div>
      </Card>
    );
  }
}

const mapStateToProps = (state, props) => ({
  users: state.users
});

const mapDispatchToProps = dispatch => ({
  dispatch
 });

export default connect(mapStateToProps, mapDispatchToProps)(View);