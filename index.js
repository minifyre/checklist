import truth from './node_modules/truth/truth.mjs'
import v from './node_modules/v/v.mjs'
const config={state:{}}

const util=
{
	id:()=>([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,util.idHelper),
	idHelper:c=>(c^util.idRand()[0]&15>>c/4).toString(16),
	idRand:()=>crypto.getRandomValues(new Uint8Array(1)),

	evt2customEl:({path})=>path.find(x=>(x.tagName||'').match('-')),

	mk:(...opts)=>Object.assign({id:util.id()},...opts),

	importFiles:paths=>Promise.all(paths.map(x=>fetch(x).then(x=>x.text()))),

	truth,
	v
}
util.mkFile=(...opts)=>util.mk({encoding:'utf-8',modified:Date.now(),path:''},...opts)
util.mkFileCode=(type='html',...opts)=>util.mkFile({category:'code',errors:[],type,value:''},...opts)
util.mkFileFont=(type='otf',...opts)=>util.mkFile({category:'font',type},...opts)
util.mkFileImg=function(type='png',...opts)
{
	return util.mkFile(
	{
		category:'rastor',
		encoding:'binary',
		height:100,
		palette:[],
		pts:[],
		type,
		width:100
	},...opts)
}
//@todo el could match select, rename to make this more clear
util.findParent=function(el,sel)
{
	while(el&&!el.matches(sel)) el=el.parentElement
	return el
}
util.mkCustomEl=async function(url='',customEl,customMkr)
{
	if(!url.length) return
	const
	[css]=await util.importFiles([url+'index.css'])
	config.css=css
	customElements.define(customEl,customMkr)
}
util.mkState=function(opts)
{
	const state=Object.assign({},config.state,opts)

	console.log(state)

	state.file.id=util.id()
	state.view.id=util.id()
	state.view.file=state.file.id
	return state
}
const logic=opts=>logic.normalize(util.mkState(opts))
logic.normalize=x=>x

const output=x=>output.render(x)
output.render=x=>x

const silo=
{
	config,
	util,
	logic,
	input:function(evt)
	{
		const
		{target,type}=evt,
		attr=`data-${type}`,
		el=util.findParent(target,`[${attr}]`)
	
		if(!el) return
	
		const
		editor=util.evt2customEl(evt),
		fn=el.getAttribute(attr)
		return input[fn](evt,editor)
	},
	output
}

onload=async function()
{
	const
	{config,util,logic,input,output}=silo,
	props='config,util,logic,input,output',
	files=await Promise.all(props.split(',').map(file=>fetch(file+'.js'))),
	txt=await Promise.all(files.map(file=>file.text())),
	fn=new Function(`{${props+',truth,v'}}`,txt.join('\n'))

	fn({config,util,logic,input,output,truth,v})

	const
	state=logic(),
	render=truth.compile(({state})=>v.render(document.body,state,output))

	//@todo add tmp list items here

	truth(state,render)
}