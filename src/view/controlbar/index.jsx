//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import isBoolean from 'lodash/isBoolean';
//内部依赖包
import clearDecorator from '../decorator/clear';
import PlayPause from '../controlbar/play-pause';
import Volume from '../controlbar/volume';
import Next from '../controlbar/next';
import Prev from '../controlbar/prev';
import FullOffScreen from '../controlbar/full-off-screen';
import Time from '../controlbar/time-container';
import TimeSlider from '../controlbar/time-slider';
import Setting from '../controlbar/setting';
import PlaybackRate from '../controlbar/playback-rate';
import SubtitleSelect from '../controlbar/subtitle-select';
import PictureQuality from '../controlbar/picture-quality';
import Rotate from '../controlbar/rotate';
import Capture from '../controlbar/capture';
import { getChildProps, cloneElement } from '../../utils/util';
import { namespace as controlbarNamespace } from '../../model/controlbar';
import { namespace as videoNamespace } from '../../model/video';
import { namespace as playPauseNamespace } from '../../model/play-pause';
import { namespace as livingNamespace } from '../../model/living';
import { namespace as readyNamespace } from '../../model/ready';
import { namespace as trackNamespace } from '../../model/track';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {
    show: state[controlbarNamespace],
    playing: state[playPauseNamespace],
    living: state[livingNamespace],
    ready: state[readyNamespace],
    subtitleList: state[trackNamespace].subtitleList,
  };
})
@clearDecorator([controlbarNamespace, livingNamespace])
export default class Controlbar extends React.Component {
  static contextTypes = {
    localization: PropTypes.object,
    controlbarHideTime: PropTypes.number,
    isHistory: PropTypes.bool,
  };
  static displayName = 'Controlbar';
  state = {};
  dispatch = this.props.dispatch;
  componentWillUnmount() {
    if (!this.context.isHistory) {
      this.dispatch({
        type: `${readyNamespace}/clear`,
      });
    }
  }
  onMouseEnter = e => {
    e.stopPropagation();
    const { playing } = this.props;
    if (playing) {
      this.dispatch({
        type: `${videoNamespace}/controlbarClearTimeout`,
        payload: {
          onControlbarEnter: true,
        },
      });
    }
  };
  onMouseLeave = e => {
    e.stopPropagation();
    const { playing } = this.props;
    if (playing) {
      this.dispatch({
        type: `${videoNamespace}/controlbar`,
        payload: false,
        delayTime: this.context.controlbarHideTime,
        onControlbarEnter: false,
      });
    }
  };
  getLocale() {
    return this.context.localization;
  }
  renderCustomButton(buttons) {
    const buttonJSX = [];
    for (let i in buttons) {
      const button = buttons[i];
      if (!button) {
        continue;
      }
      if (!React.isValidElement(button)) {
        console.error('自定义按钮必须是React组件！');
        continue;
      }
      buttonJSX.push(
        cloneElement(button, {
          className: classnames(
            'html5-player-small-button',
            getChildProps(button).className
          ),
          key: i,
        })
      );
    }
    return buttonJSX;
  }
  render() {
    const {
      playbackRates,
      playbackRateControls,
      show,
      muted,
      tracks,
      isLiving,
      ready,
      timeSliderShowFormat,
      hasFragment,
      subtitleList,
      customTimeSlider,
    } = this.props;
    let { living } = this.props;
    const { isHistory } = this.context;
    if (isLiving) {
      living = true;
    }
    const locale = this.getLocale();
    let { controls = true } = this.props;
    if (isBoolean(controls)) {
      if (!controls) {
        //controls=false时，需要设置这些值为false
        controls = {
          playPause: false,
          volume: false,
          prev: false,
          next: false,
          fullscreen: false,
          setting: false,
          time: false,
          timeSlider: false,
          speed: false,
          subtitle: false,
          pictureQuality: false,
          rotate: false,
          capture: false,
        };
      } else {
        controls = {};
      }
    }
    let {
      playPause = true,
      volume = true,
      prev = true,
      next = true,
      fullscreen = true,
      setting = false,
      time = true,
      timeSlider = true,
      speed = false,
      subtitle = true,
      pictureQuality = true,
      rotate = false,
      capture = false,
      ...customButton
    } = controls;
    return (
      <div
        className={classnames('html5-player-controlbar', {
          'html5-player-hide': !show,
          'html5-player-show': show,
        })}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        {ready &&
          !living &&
          !customTimeSlider &&
          timeSlider && (
            <TimeSlider
              hasFragment={hasFragment}
              tracks={tracks}
              timeSliderShowFormat={timeSliderShowFormat}
            />
          )}
        {ready && !living && customTimeSlider}
        <div className="html5-player-button-container">
          {playPause && <PlayPause living={living} />}
          {volume && (
            <Volume
              autoMuted={muted}
              living={living}
              hasFragment={hasFragment || isHistory}
            />
          )}
          {living && (
            <button
              type="button"
              className="html5-player-small-button cursor-default html5-player-live-button"
            >
              <svg
                className="html5-player-icon html5-player-live-icon"
                aria-hidden="true"
              >
                <use xlinkHref="#icon-live" />
              </svg>
            </button>
          )}
          {!isHistory && prev && <Prev />}
          {!isHistory && next && <Next />}
          {ready && !living && time && <Time />}
          {fullscreen && <FullOffScreen />}
          {ready &&
            setting && (
              <Setting
                living={living}
                playbackRates={playbackRates}
                playbackRateControls={playbackRateControls}
              />
            )}
          {rotate && <Rotate />}
          {capture && <Capture />}
          {ready &&
            !living &&
            speed && (
              <PlaybackRate playbackRates={playbackRates} locale={locale} />
            )}
          {ready &&
            !living &&
            subtitleList[0] &&
            subtitle && <SubtitleSelect locale={locale} />}
          {ready &&
            !living &&
            pictureQuality && <PictureQuality locale={locale} />}
          {ready && this.renderCustomButton(customButton)}
        </div>
      </div>
    );
  }
}
