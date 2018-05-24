import React from 'react';
import { Provider } from 'react-redux';
import Root from './src/components/root';
import createStore from './src/redux/createStore';

class App extends React.Component {
  render() {
    const store = createStore();
    return (
      <Provider store={store}>
        <Root />
      </Provider>
    )
  }
}

export default App;