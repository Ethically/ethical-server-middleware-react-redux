'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _redux = require('redux');

var _reactRedux = require('react-redux');

var _server = require('react-dom/server');

var _reactRouterDom = require('react-router-dom');

var _ethicalUtilityPromiseCollector = require('ethical-utility-promise-collector');

var _ethicalUtilityPromiseCollector2 = _interopRequireDefault(_ethicalUtilityPromiseCollector);

var _ethicalReactComponentProviderPromise = require('ethical-react-component-provider-promise');

var _ethicalReactComponentProviderPromise2 = _interopRequireDefault(_ethicalReactComponentProviderPromise);

var _ethicalScriptsFrontend = require('ethical-scripts-frontend');

var _ethicalScriptsFrontend2 = _interopRequireDefault(_ethicalScriptsFrontend);

var _ethicalUtilityPath = require('ethical-utility-path');

var _graphql = require('graphql');

var _reactHelmet = require('react-helmet');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const reactReduxMiddleware = (() => {
    var _ref = _asyncToGenerator(function* (ctx, next, config) {
        const { method, request, response } = ctx;
        const { body } = response;
        if (body !== undefined) {
            return yield next();
        }

        const { routes, layout, reducers, graphqlSchema, graphqlRoot } = config;
        const { url } = request;
        const { default: Layout } = require((0, _ethicalUtilityPath.absolute)(layout));
        const { default: Routes } = require((0, _ethicalUtilityPath.absolute)(routes));
        const { default: reducer } = require((0, _ethicalUtilityPath.absolute)(reducers));
        const promise = (0, _ethicalUtilityPromiseCollector2.default)();
        const store = (0, _redux.createStore)((0, _redux.combineReducers)(reducer));
        const html = yield renderRoute({ url, Routes, store, promise });
        const root = _react2.default.createElement('ethical-root', { dangerouslySetInnerHTML: { __html: html } });
        const helmet = _reactHelmet.Helmet.renderStatic();
        const scripts = (0, _ethicalScriptsFrontend2.default)(store.getState());
        const props = {
            html: helmet.htmlAttributes.toComponent(),
            body: helmet.bodyAttributes.toComponent(),
            title: helmet.title.toComponent(),
            meta: helmet.meta.toComponent(),
            link: helmet.link.toComponent(),
            scripts,
            root
        };

        response.body = renderLayout(Layout, props);

        yield next();
    });

    return function reactReduxMiddleware(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
})();

const reactReduxMiddlewareInit = config => (() => {
    var _ref2 = _asyncToGenerator(function* (ctx, next) {
        return yield reactReduxMiddleware(ctx, next, config);
    });

    return function (_x4, _x5) {
        return _ref2.apply(this, arguments);
    };
})();

exports.default = reactReduxMiddlewareInit;


const renderRoute = (() => {
    var _ref3 = _asyncToGenerator(function* (context) {
        const router = {};
        const html = yield renderReactComponents(Object.assign({}, context, { router }));
        const { url } = router;
        if (url) {
            return renderRoute(Object.assign({}, context, { url }));
        }
        return html;
    });

    return function renderRoute(_x6) {
        return _ref3.apply(this, arguments);
    };
})();

const renderReactComponents = (() => {
    var _ref4 = _asyncToGenerator(function* (context) {

        const { url, router, Routes, store, promise } = context;
        const render = function () {
            return (0, _server.renderToString)(_react2.default.createElement(
                _ethicalReactComponentProviderPromise2.default,
                { promise: promise },
                _react2.default.createElement(
                    _reactRedux.Provider,
                    { store: store },
                    _react2.default.createElement(
                        _reactRouterDom.StaticRouter,
                        { context: router, location: url },
                        Routes
                    )
                )
            ));
        };

        const html = render();
        const promises = promise();
        const { length } = promises;
        if (length === 0) {
            return html;
        }

        yield Promise.all(promises);
        return render();
    });

    return function renderReactComponents(_x7) {
        return _ref4.apply(this, arguments);
    };
})();

const renderLayout = (Layout, props) => (0, _server.renderToStaticMarkup)(_react2.default.createElement(Layout, Object.assign({}, props)));
//# sourceMappingURL=index.js.map