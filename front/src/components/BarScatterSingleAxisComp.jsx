import React from 'react';
import { Card, Radio, Switch } from 'antd';
import Chart from '../views/bar-scatter-single-axis-chart';
import './view-comp-style.less';
import { connect } from "react-redux";

class View extends React.PureComponent {
  comparValObj = {
    'compar': 'all',
    'sta': 'sum'
  };

  componentDidMount() {
    Chart.init(this.container, this.comparValObj, this.props.dispatch);
  }

  onComparChange = e => {
    e.target.value === 'all' || e.target.value === 'respectively' ?
    this.comparValObj.compar = e.target.value :
    this.comparValObj.sta = e.target.value;
    Chart.update(this.comparValObj, this.props.dispatch);
  };

  zoomSwitchChange(checked) {
    Chart.zoomSwitchChange(checked);
  }

  render() {
    return (
      <Card className="view view-a" title="Group Behavior View" extra={
        <div>
            <span className="func-span">Layout: </span>
            <Radio.Group onChange={this.onComparChange} defaultValue="all" size="small">
              <Radio.Button value="all">All</Radio.Button>
              <Radio.Button value="respectively">Single</Radio.Button>
            </Radio.Group>
            <span className="func-span">Encode: </span>
            <Radio.Group onChange={this.onComparChange} defaultValue="sum" size="small">
              <Radio.Button value="sum">Sum</Radio.Button>
              <Radio.Button value="ave">Avg</Radio.Button>
            </Radio.Group>
            <Switch 
              checkedChildren="Zoom-in On" 
              unCheckedChildren="Zoom-in Off" 
              onChange={checked => this.zoomSwitchChange(checked)}
            />
        </div>
      }>
        <div className="view-container" ref={ ref => this.container = ref }></div>
        <div className="tooltip"></div>
      </Card>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  dispatch
});

export default connect(null, mapDispatchToProps)(View);