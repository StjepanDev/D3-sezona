// select the svg container first
const svg = d3
  .select('.canvas')
  .append('svg')
  .attr('width', 1000)
  .attr('height', 700);

// create margins & dimensions
const margin = { top: 20, right: 20, bottom: 100, left: 100 };
const graphWidth = 1000 - margin.left - margin.right;
const graphHeight = 700 - margin.top - margin.bottom;

const graph = svg
  .append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// create axes groups
const xAxisGroup = graph
  .append('g')
  .attr('transform', `translate(0, ${graphHeight})`);

xAxisGroup
  .selectAll('text')
  .attr('fill', 'orange')
  .attr('transform', 'rotate(-40)')
  .attr('text-anchor', 'end');

const yAxisGroup = graph.append('g');

const y = d3.scaleLinear().range([graphHeight, 0]);

const x = d3
  .scaleBand()
  .range([0, graphWidth])
  .paddingInner(0.2)
  .paddingOuter(0.2);

// create & call axes
const xAxis = d3.axisBottom(x);
const yAxis = d3
  .axisLeft(y)
  .ticks(20)
  .tickFormat((d) => d);

const t = d3.transition().duration(2000);

// the update function
const update = (data) => {
  // join the data to circs
  const rects = graph.selectAll('rect').data(data);

  // remove unwanted rects
  rects.exit().remove();

  // update the domains
  y.domain([0, d3.max(data, (d) => d.dolasci)]);
  x.domain(data.map((item) => item.zemlja));

  // add attrs to rects already in the DOM
  rects
    .attr('width', x.bandwidth)
    .attr('fill', 'lightblue')
    .attr('x', (d) => x(d.zemlja))
    .transition(t)
    .attr('height', (d) => graphHeight - y(d.dolasci))
    .attr('y', (d) => y(d.dolasci));

  // append the enter selection to the DOM
  rects
    .enter()
    .append('rect')
    .attr('width', 0)
    .attr('height', (d) => 0)
    .attr('fill', 'lightblue')
    .attr('x', (d) => x(d.zemlja))
    .attr('y', (d) => graphHeight)
    .transition(t)
    .attrTween('width', widthTween)
    .attr('height', (d) => graphHeight - y(d.dolasci))
    .attr('y', (d) => y(d.dolasci));

  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
};

let data = [];

db.collection('countries').onSnapshot((res) => {
  res.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex((item) => item.id == doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter((item) => item.id !== doc.id);
        break;
      default:
        break;
    }
  });

  update(data);
});

// Tweens
const widthTween = (d) => {
  let i = d3.interpolate(0, x.bandwidth());
  return function (t) {
    return i(t);
  };
};
