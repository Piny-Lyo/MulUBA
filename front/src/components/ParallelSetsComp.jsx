import React from 'react';
import { Card, Select, Switch } from 'antd';
import Chart from '../views/parallel-sets';
import './view-comp-style.less';

const { Option } = Select;

const groups = [
  <Option key='G1'>G1</Option>,
  <Option key='G2'>G2</Option>,
  <Option key='G3'>G3</Option>,
  <Option key='G4'>G4</Option>,
  <Option key='G5'>G5</Option>
];

class View extends React.PureComponent {

  componentDidMount() {
    Chart.init(this.container);
  }

  groupsChange(groups) {
    Chart.filter(groups, this.topKSwitchRef.rcSwitch.state.checked);
  }

  topKSwitchChange(topKChecked) {
    Chart.filter(this.groupsSelectRef.rcSelect.state.value, topKChecked);
  }

  render() {
    return (
      <Card className="view view-b" title="Subgroup Profile View" extra={
        <div>
          <Switch 
            checkedChildren="Top3 On" 
            unCheckedChildren="Top3 Off" 
            onChange={checked => this.topKSwitchChange(checked)}
            ref={ref => this.topKSwitchRef = ref}
          />
          <span className="func-span">Groups Filter: </span>
          <Select
            mode="multiple"
            style={{ width: 330 }}
            size="small"
            placeholder="Please select"
            defaultValue={['G1', 'G2', 'G3', 'G4', 'G5']}
            onChange={value => this.groupsChange(value)}
            ref={ref => this.groupsSelectRef = ref}
          >
          {groups}
          </Select>
        </div>
      }>
        <div className="view-container" ref={ref => this.container = ref}></div>
        <div className="tooltip"></div>
      </Card>
    );
  }
}

export default View;