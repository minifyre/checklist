import silo from './node_modules/silo/index.js'
import truth from './node_modules/truth/truth.mjs'
import v from './node_modules/v/v.mjs'

const
{config,util,logic,output,input}=silo,
{curry}=util

export default silo(async function init(initialState)
{
	const
	state=logic(initialState),
	render=truth.compile(({state})=>v.render(document.body,state,output))

	truth(state,render)
})