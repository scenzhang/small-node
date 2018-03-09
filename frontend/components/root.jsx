
import { HashRouter } from 'react-router-dom';
import App from './app';
import React from 'react';
import { Provider, connect } from 'react-redux';
import { fetchCurrentUser } from '../actions/session_actions';
const Root = ({ store }) => (
  <Provider store={ store }>
    <HashRouter>
      <App/>
    </HashRouter>
  </Provider>
);
// const componentDidMount = () => {
//   alert(0);
//   this.props.fetchCurrentUser();
// }

// const mapDispatchToProps = (dispatch, ownProps) => {
//   return {
//     fetchCurrentUser: () => dispatch(fetchCurrentUser())
//   }
// }
// export default connect(null, mapDispatchToProps)(Root);

export default Root;