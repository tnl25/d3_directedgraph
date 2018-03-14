import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  ngOnInit() {
    console.log('D3.js version:', d3['version']);

    this.loadForceDirectedGraph();
  }

  loadForceDirectedGraph() {
    const svg = d3.select('svg');
    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const color = d3.scaleOrdinal(d3.schemeCategory20);

    const simulation = d3.forceSimulation()
      .force('link', d3
        .forceLink()
        .id((d) => d['id'])
        .strength((d) => d['strength'])
      )
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(width / 2, height / 2));

    d3.json('assets/animalkingdom.json', (err, data) => {
      if (err) { throw new Error('Bad data file!'); }

      function getNodeColor(node) {
        if (node.level === 0) {
          return 'red';
        } else if (node.level === 1) {
          return 'green';
        } else {
          return 'gray';
        }

      }

      const link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(data['links'])
        .enter()
        .append('line')
        .attr('stroke-width', (d) => Math.sqrt(d['value']))
        .attr('stroke', '#E5E5E5');

      const node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(data['nodes'])
        .enter()
        .append('circle')
        .attr('r', 10)
        .attr('fill', getNodeColor)
        .call(d3.drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
        );

      // const textElements = svg.append('g')
      //   .selectAll('text')
      //   .data(data['nodes'])
      //   .enter()
      //   .append('text')
      //   .text(function (d) {
      //     let text = d['label']
      //     console.log(text)
      //     return text
      //   })
      //   .attr('font-size', 15)
      //   .attr('dx', 15)
      //   .attr('dy', 4);

      node.on('mouseover', function () {
        d3.event.stopPropagation();

        d3.select(this)
          .transition()
          .duration(1000)
          .attr('r', 15)

        let textElement = svg
          .selectAll('.nodes')
          .append('g')
          .data(data['nodes'])
          .enter()
          .append('text')
          .attr('class', 'text-element')
          .text(function (d) {
            let text = d['label']
            console.log(text)
            return text
          })
          .attr('font-size', 15)
          .attr('dx', 15)
          .attr('dy', 4)
          .attr('x', function (d) { return d['x'] })
          .attr('y', function (d) { return d['y'] })
      })

      node.on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(1000)
          .attr('r', 10)

        d3.selectAll('.text-element').remove();

      })




      simulation
        .nodes(data['nodes'])
        .on('tick', ticked);

      simulation.force<d3.ForceLink<any, any>>('link')
        .links(data['links']);

      function ticked() {
        link
          .attr('x1', function (d) { return d['source'].x; })
          .attr('y1', function (d) { return d['source'].y; })
          .attr('x2', function (d) { return d['target'].x; })
          .attr('y2', function (d) { return d['target'].y; });

        node
          .attr('cx', function (d) { return d['x']; })
          .attr('cy', function (d) { return d['y']; });

        // textElements
        //   .attr('x', function (d) { return d['x'] })
        //   .attr('y', function (d) { return d['y'] });

      }
    });

    function dragStarted(d) {
      if (!d3.event.active) { simulation.alphaTarget(0.7).restart(); }
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragEnded(d) {
      if (!d3.event.active) { simulation.alphaTarget(0); }
      d.fx = null;
      d.fy = null;
    }
  }
}
