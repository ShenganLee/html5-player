//外部依赖包
import React from 'react';
import PropTypes from 'prop-types';
//内部依赖包
import Provider from 'src/libs/provider/saga-model-provider';
import modelList from './model-list';
import View from 'src/view';
//icon的js
import 'src/assets/icon/iconfont';

import outsideApi from '../unit/outside-api';
import * as autostartFalseVideo from '../unit/model/autostart-false-video.js';
const unit = [];

class ModelRegister extends React.Component {
  static contextTypes = {
    sagaStore: PropTypes.object,
  };
  displayName = 'ModelRegister';
  state = {};
  registerModel = register => {
    const allModelPromise = modelList.map(modelId => {
      const model = require(`src/model/${modelId}.js`).default;
      return { model, modelId };
    });
    const store = this.context.sagaStore;
    return Promise.all(allModelPromise)
      .then(models => {
        models.forEach(m => {
          let model = m.model();
          switch (m.modelId) {
            case 'video/index':
              autostartFalseVideo.getModelObject(
                model,
                this.props,
                store.dispatch,
                store
              );
              break;
            default:
          }
          register(model);
        });
        return models;
      })
      .then(function(models) {
        models.forEach(m => {
          switch (m.modelId) {
            case 'video/index':
              unit.push(autostartFalseVideo.default);
              break;
            default:
          }
        });
      });
  };
  componentDidMount() {
    this.registerModel(this.context.sagaStore.register).then(() => {
      this.setState({
        canBeRendered: true,
      });
    });
  }
  render() {
    const { children } = this.props;
    if (this.state.canBeRendered) {
      return <span>{children}</span>;
    } else {
      return false;
    }
  }
}
export default function player(props) {
  return (
    <Provider
      production={process.env.NODE_ENV === 'production'}
      plugins={[
        {
          onError: (error, dispatch) => {
            console.error(error);
          },
        },
      ]}
    >
      <ModelRegister {...props}>
        <View
          {...props}
          videoCallback={function(player) {
            outsideApi(player);
            unit.forEach(v => {
              v(player);
            });
          }}
        />
      </ModelRegister>
    </Provider>
  );
}
