import silo from './node_modules/silo/index.js'
import truth from './node_modules/truth/truth.mjs'
import v from './node_modules/v/v.mjs'

const {config,util,logic,output,input}=silo

export default Object.assign(async function init()
{
	const
	state=logic(),
	render=truth.compile(({state})=>v.render(document.body,state,output))

	//@todo remove tmp debugging file code
	await fetch('default.checklist.json')
	.then(res=>res.json())
	.then(file=>Object.assign(state.file,file))
	.catch(console.error)

	truth(state,render)
},silo)