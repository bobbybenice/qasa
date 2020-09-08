import React from 'react';
import { TweenMax, Power2 } from "greensock";

const lineEq = (y2, y1, x2, x1, currentVal) => {
  var m = (y2 - y1) / (x2 - x1), b = y1 - m * x1;
  return m * currentVal + b;
};

const distanceThreshold = { min: 0, max: 100 };
  
const distancePoints = (x1, y1, x2, y2) => Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));

const getMousePos = (e) => {
  let event = e;
  var posx = 0, posy = 0;
  if (!event) {event = window.event;}
  if (event.pageX || event.pageY) 	{
    posx = event.pageX;
    posy = event.pageY;
  }
  else if (event.clientX || event.clientY) 	{
    posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  return { x : posx, y : posy };
};
  
class Nearby {
  constructor(el, options) {
    this.DOM = { el: el };
    this.options = options;
    this.init();
  }
  init() { 
    this.mousemoveFn = (ev) => requestAnimationFrame(() => {
      const mousepos = getMousePos(ev);
      const docScrolls = { left : document.body.scrollLeft + document.documentElement.scrollLeft, top : document.body.scrollTop + document.documentElement.scrollTop };
      const elRect = this.DOM.el.getBoundingClientRect();
      const elCoords = {
        x1: elRect.left + docScrolls.left, x2: elRect.width + elRect.left + docScrolls.left,
        y1: elRect.top + docScrolls.top, y2: elRect.height + elRect.top + docScrolls.top
      };
      const closestPoint = { x: mousepos.x, y: mousepos.y };
              
      if ( mousepos.x < elCoords.x1 ) {
        closestPoint.x = elCoords.x1;
      }
      else if ( mousepos.x > elCoords.x2 ) {
        closestPoint.x = elCoords.x2;
      }
      if ( mousepos.y < elCoords.y1 ) {
        closestPoint.y = elCoords.y1;
      }
      else if ( mousepos.y > elCoords.y2 ) {
        closestPoint.y = elCoords.y2;
      }
      if ( this.options.onProgress ) {
        this.options.onProgress(distancePoints(mousepos.x, mousepos.y, closestPoint.x, closestPoint.y));
      }
    });

    window.addEventListener('mousemove', this.mousemoveFn);
  }
}

window.Nearby = Nearby;

class ProximityComponent extends React.Component {
  componentDidMount() {
    this.renderItem();
  }
  renderItem() {
    /**************** Animated Item ****************/
    const item = this.props.forwardedRef.current;
    const itemParent = item.parentNode;
    const { animInterval } = this.props;

    const animOptions = {
      yoyoEase: Power2.easeOut,
      repeat: this.props.repeat || -1,
      yoyo: this.props.yoyo,
      paused: true
    };

    const grayscaleInterval = { from: 1, to: 0 };
    
    let { end = {} } = this.props;
    let tweenItem = TweenMax.to(item, 5, Object.assign(animOptions, end));
    
    let stateItem = 'paused';
    new Nearby(itemParent, {
      onProgress: (distance) => {

        if (this.props.type === 'y') {
          const time = lineEq(animInterval.from, animInterval.to, distanceThreshold.min, distanceThreshold.max, distance);
          tweenItem = TweenMax.to(item, .8, {
              ease: 'Expo.easeOut',
              y: `${Math.max(Math.min(animInterval.from, time), animInterval.to)}%`,
          });
          const o = lineEq(0, 1, distanceThreshold.max, distanceThreshold.min, distance);
          const tweenItem2 = TweenMax.to(item, .5, {
            ease: 'Expo.easeOut',
            opacity: Math.max(o, 0)
          });
          if (this.props.pause) {
            tweenItem.pause();
            tweenItem2.pause();
          }
        }

        if (this.props.type !== 'y') {
          const time = lineEq(animInterval.from, animInterval.to, distanceThreshold.max, distanceThreshold.min, distance);
          tweenItem.timeScale(Math.min(Math.max(time,animInterval.from),animInterval.to));
          if ( distance < distanceThreshold.max && distance >= distanceThreshold.min && stateItem !== 'running' ) {
              tweenItem.play();
              stateItem = 'running';
          }
          else if ( (distance > distanceThreshold.max || distance < distanceThreshold.min) && stateItem !== 'paused' ) {
              tweenItem.pause();
              stateItem = 'paused';
              TweenMax.to(item, .2, {
                  ease: Power2.easeOut,
                  onComplete: () => tweenItem.time(0)
              });
          }
          const bw = lineEq(grayscaleInterval.from, grayscaleInterval.to, distanceThreshold.max, distanceThreshold.min, distance);
          TweenMax.to(item, 1, {
              ease: Power2.easeOut,
              filter: `grayscale(${Math.min(bw,grayscaleInterval.from)})`,
          });
        }
      }
    });
  }
  render() {
    const { forwardedRef, children } = this.props;
    const childrenWithProps = React.Children.map(children, child =>
      React.cloneElement(child, { className: `${this.props.className} css-animated__item`, ref: forwardedRef }));
    return (
      <div
        className={`${this.props.parentClassName} css-animated__parent`}
      >
        {childrenWithProps}
      </div>
    );
  }
}

const Proximity = React.forwardRef((props, ref) => {
  return (
    <ProximityComponent
      {...props}
      forwardedRef={ref}
    />
  );
});

export default Proximity;
