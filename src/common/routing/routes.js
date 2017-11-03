// @flow
import React from 'react'
import {Route} from 'react-router-dom'
import RouteAuth from 'components/addons/RouteAuth'
import {asyncComponent} from 'react-async-component'
import {Loader, Dimmer, Header, Icon} from 'semantic-ui-react'
import _ from 'lodash'
import type {RouteItem} from 'types'

function asyncComponentCreator (url) {
	const importCreator = (url: string) => async () => {
		// Read Webpack docs about code-splitting for more info.
		if (process.env.BROWSER) {
			const resolve = import(/* webpackMode: "lazy", webpackChunkName: "[request].lazy" */ `containers/${url}/index.jsx`)
			return resolve
		}
		const resolve = import(/* webpackMode: "eager" */ `containers/${url}/index.jsx`)
		return resolve
	}

	return asyncComponent({
		resolve: importCreator(url),
		LoadingComponent () {
			return (
				<Dimmer active>
					<Loader size="large" active>
						Loading page...
					</Loader>
				</Dimmer>
			)
		},
		ErrorComponent () {
			return (
				<Dimmer active>
					<Header inverted as="h2" icon textAlign="center">
						<Icon name="refresh" />
						Refresh
						<Header.Subheader>Got error while loading page.</Header.Subheader>
					</Header>
				</Dimmer>
			)
		},
		autoResolveES2015Default: true,
		env: process.env.BROWSER ? 'browser' : 'node',
		serverMode: 'resolve'
	})
}

function routingFnCreator (useFor: 'sidebar' | 'routing' | 'all' = 'all') {
	const routes: Array<RouteItem> = [
		{
			path: '/',
			exact: true,
			icon: 'newspaper',
			name: 'Dashboard',
			sidebarVisible: true,
			tag: RouteAuth,
			component: asyncComponentCreator('Dashboard')
		},
		{
			path: '/links',
			name: 'Links',
			exact: true,
			icon: 'bookmark',
			sidebarVisible: true,
			tag: RouteAuth,
			component: asyncComponentCreator('Links')
		},
		{
			external: true,
			path: 'https://github.com/Metnew/react-semantic.ui-starter',
			icon: 'github',
			name: 'Github',
			sidebarVisible: true
		},
		{
			path: '/auth',
			name: 'Auth',
			exact: true,
			tag: Route,
			component: asyncComponentCreator('Login')
		}
		// find the way to add/remove routes conditionally
		// {
		// 	name: '404',
		// 	tag: RouteAuth,
		// 	component: asyncComponentCreator('NotFound')
		// }
	]

	const fns = {
		// Returns routing for sidebar menu
		sidebar (x: Array<RouteItem> = routes) {
			return x
				.filter(a => a.sidebarVisible)
				.map(a =>
					_.pick(a, ['path', 'name', 'icon', 'external', 'strict', 'exact'])
				)
		},
		// Returns routing for React-Router
		routing (x: Array<RouteItem> = routes) {
			return x
				.filter(a => !a.sidebarVisible)
				.map(a => _.pick(a, ['path', 'name', 'strict', 'exact', 'component', 'tag']))
		},
		all () {
			return routes
		}
	}

	return fns[useFor]
}

export const getRoutes = routingFnCreator()
export const getSidebarRoutes = routingFnCreator('sidebar')
export const getRouterRoutes = routingFnCreator('routing')
