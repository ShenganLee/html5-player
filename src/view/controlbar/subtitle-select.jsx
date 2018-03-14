//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import classnames from 'classnames';
//内部依赖包
import Tooltip from '../components/tooltip';
import clearDecorator from '../decorator/clear';
import SubtitleList from './setting/subtitle-list';
import { namespace as trackNamespace } from '../../model/track';

@connect(state => {
  return {
    subtitleList: state[trackNamespace].subtitleList,
    subtitleId: state[trackNamespace].subtitleId,
  };
})
@clearDecorator([])
export default class SubtitleSelect extends React.Component {
  displayName = 'subtitleSelect';
  state = {};
  renderContent() {
    return <SubtitleList />;
  }
  render() {
    const { subtitleList, locale } = this.props;
    if (!subtitleList[0]) {
      return false;
    }
    return (
      <Tooltip content={this.renderContent()} toTargetGap={20}>
        <span className="float-right cursor-pointer html5-player-common-button">
          {locale.subtitle}
        </span>
      </Tooltip>
    );
  }
}
