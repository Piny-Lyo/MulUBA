import React from 'react';
import './App.less';
import BarScatterSingleAxisComp from './components/BarScatterSingleAxisComp';
import ParallelSetsComp from './components/ParallelSetsComp';
import ImprovedMosaicComp from './components/ImprovedMosaicComp';
import CircularHeatmapComp from './components/CircularHeatmapComp';
import BehaviorPatternChartComp from './components/BehaviorPatternChartComp';

function App() {
  return (
    <div className="App">
        <BarScatterSingleAxisComp></BarScatterSingleAxisComp>
        <ParallelSetsComp></ParallelSetsComp>
        <ImprovedMosaicComp></ImprovedMosaicComp>
        <div className="view-de">
          <CircularHeatmapComp></CircularHeatmapComp>
          <BehaviorPatternChartComp></BehaviorPatternChartComp>
        </div>
    </div>
  );
}
  
  export default App;
