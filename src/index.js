import React from 'react'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import createPromiseCollector from 'ethical-utility-promise-collector'
import PromiseProvider from 'ethical-react-component-provider-promise'
import getInitScripts from 'ethical-scripts-frontend'
import { absolute } from 'ethical-utility-path'
import { graphql, buildSchema } from 'graphql'
import { Helmet } from 'react-helmet'

const reactReduxMiddleware = async (ctx, next, config) => {
    const { method, request, response } = ctx
    const { body } = response
    if (body !== undefined) {
        return await next()
    }

    const { routes, layout, reducers, graphqlSchema, graphqlRoot } = config
    const { url } = request
    const { default: Layout } = require(absolute(layout))
    const { default: Routes } = require(absolute(routes))
    const { default: reducer } = require(absolute(reducers))
    const promise = createPromiseCollector()
    const store = createStore(combineReducers(reducer))
    const html = await renderRoute({ url, Routes, store, promise })
    const root = <ethical-root dangerouslySetInnerHTML={ { __html: html } } />
    const helmet = Helmet.renderStatic()
    const scripts = getInitScripts(store.getState())
    const props = {
        html: helmet.htmlAttributes.toComponent(),
        body: helmet.bodyAttributes.toComponent(),
        title: helmet.title.toComponent(),
        meta: helmet.meta.toComponent(),
        link: helmet.link.toComponent(),
        scripts,
        root
    }

    response.body = renderLayout(Layout, props)

    await next()
}

const reactReduxMiddlewareInit = (config) => (
    async (ctx, next) => await reactReduxMiddleware(ctx, next, config)
)

export default reactReduxMiddlewareInit

const renderRoute = async (context) => {
    const router = {}
    const html = await renderReactComponents({ ...context, router })
    const { url } = router
    if (url) {
        return renderRoute({ ...context, url })
    }
    return html
}

const renderReactComponents = async (context) => {

    const { url, router, Routes, store, promise } = context
    const render = () => renderToString(
        <PromiseProvider promise={promise}>
            <Provider store={store}>
                <StaticRouter context={router} location={url}>
                    {Routes}
                </StaticRouter>
            </Provider>
        </PromiseProvider>
    )

    const html = render()
    const promises = promise()
    const { length } = promises
    if (length === 0) {
        return html
    }

    await Promise.all(promises)
    return render()
}

const renderLayout = (Layout, props) => renderToStaticMarkup(
    <Layout { ...{ ...props} } />
)
