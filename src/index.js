import silo from './silo.js'

onload=async function()
{
	const
	scope=Object.assign(silo,{}),//add custom dependencies here & next line
	{config,util,logic,output,input,truth,v}=await silo(scope),
	state=logic(),
	render=truth.compile(({state})=>v.render(document.body,state,output))

	//@todo remove tmp debugging file code
	await fetch('default.checklist.json')
	.then(res=>res.json())
	.then(file=>Object.assign(state.file,file))
	.catch(console.error)

	truth(state,render)
}