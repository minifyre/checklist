import silo from './silo.js'
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
config.state=
{
	file:
	{
		meta:{},
		data:{}
	},
	view:
	{
		edit:'',
		layout:'list',
		move:[],
		path:['index'],
		selected:[],
		theme:['red','darkorange','#fc0']
	}
}
util.empty=txt=>!txt.replace(/\s/g,'').length
//useful when rerendering before array length is updated (e.g. pop/splice)
util.mapEmpty=(arr,fn)=>arr.filter(x=>!!x).map(fn)
util.rand=(max,min=1,seed=Math.random())=>Math.floor(seed*(max-min+1))
util.shuffle=function(arr)
{
	arr.map(()=>util.rand(arr.length-1,0))
	.forEach((j,i)=>[arr[i],arr[j]]=[arr[j],arr[i]])

	return arr
}
util.themeGradient=function(theme,length)
{
	const
	h=100,
	w=1,
	can=Object.assign(document.createElement('canvas'),{height:h,width:w,style:`height:100px; width:100px;`}),
	ctx=can.getContext('2d'),
	grd=ctx.createLinearGradient(0,0,0,h)

	theme.forEach((color,i,{length})=>grd.addColorStop(i/length,color))
	ctx.fillStyle=grd
	ctx.fillRect(0,0,w,h)

	return Array(length)
	.fill(1)
	.map(function(_,i,{length})
	{
		const
		y=parseInt(i/length*100),
		rgb=ctx.getImageData(0,y,1,1).data.slice(0,3)

		return `rgb(${rgb.join(',')})`
	})
}
util.txt2txts=function(txt)
{
	return txt.split(config.newline)
			.filter(x=>x.length)
			.map(util.txtRepeat)
			.reduce(util.flatten,[])
}
util.txtRepeat=function(txt)
{
	const repeat=/X:\d+-\d+/

	if(!txt.match(repeat)) return [txt]

	const
	[replace]=txt.match(repeat),//X:11-2
	[min,max]=replace.split(':')[1]//11-2
			.split('-')//[11','2']
			.map(d=>parseInt(d))//[11,2]
			.sort((a,b)=>a-b)//[2,11]//sort() will keep 11 in front

	return Array(max-min+1)
			.fill(min)
			.map((d,i)=>d+i)
			.map(d=>txt.replace(repeat,d))
	}
//@todo may need a guard to make sure 'index' is alway the first item in path
logic.back=function(state)
{
	const
	mode=logic.mode(state),
	path=logic.path(state)

	if(mode==='path'&&path.length===1) return

	logic.path(state).pop()
}
logic.complete=function(state,deselectAll=true)
{
	const
	{data}=state.file,
	ids=deselectAll===true?state.view.selected:deselectAll

	ids
	.map(id=>data[id])
	.forEach(function(item)
	{
		//@todo can this cause overflow?
			//put after parent is changed?
		logic.complete(state,item.list)
		item.complete=true
	})

	if(deselectAll) logic.deselectAll(state)
}
logic.deselectAll=state=>state.view.selected=[]
logic.edit=(state,id='')=>state.view.edit=id
logic.isComplete=(state,id)=>(state.file.data[id]||{}).complete
logic.item=(...opts)=>util.mk({complete:false,text:'',list:[]},...opts)
logic.itemAdd=function(state,item,parentId='index',at=-1)
{
	const {id}=item,
	siblings=state.file.data[parentId].list

	state.file.data[id]=item
	siblings.splice(at>-1?at:siblings.length,0,id)
	logic.edit(state,id)
}
logic.itemUpdate=function(state,id,opts)//@todo have a text specifc fn?
{
	delete opts.id//don't allow changes to id
	Object.assign(state.file.data[id],opts)
}

//@todo come up with a better name
//retrieves the id of the youngest list
logic.listLowest=state=>logic.path(state).slice(-1)[0]
//@todo change path to view?
logic.mode=state=>state.view.move.filter(x=>!!x).length?'move':'path'
logic.move=state=>state.view.move=['index']
logic.moveItems=function(state,parentId,children)
{
	children.forEach(util.curry(logic.unlink,state))
	state.file.data[parentId].list.push(...children)
}
logic.normalize=function(state)
{
	if(!state.file.data.index) state.file.data.index=logic.item({id:'index'})
	return state
}
logic.open=function(state,id)
{
	let
	path=logic.path(state),
	i=	path.map(id=>state.file.data[id])
		.findIndex(item=>item.list.includes(id)),
	mode=logic.mode(state)
	//close sibling lists & add to the end
	state.view[mode]=[...path.slice(0,i+1),id]
}
logic.openToggle=function(state,id)
{
	let
	path=logic.path(state),
	i=path.indexOf(id),
	mode=logic.mode(state)

	if(i===-1) return console.error(`${id} was not open`)
	state.view[mode]=path.slice(0,i)
}
logic.parent=function(state,childId)
{//@todo multiple parents will make this harder
	return Object.entries(state.file.data)
	.find(([_,{list}])=>list.includes(childId))[0]
}
logic.path=state=>state.view[logic.mode(state)]
logic.remove=function(state,id)
{
	if(!state.file.data[id]) return//item was already deleted
	
	//delete children
	state.file.data[id].list.forEach(id=>logic.remove(state,id))

	//@todo if items chan have multiple parents, this needs to be overhauled

	//delete links to item
	logic.unlink(state,id)

	delete state.file.data[id]
}
logic.unlink=function(state,id)
{
	Object.values(state.file.data)
	.forEach(function({list})
	{
		const i=list.indexOf(id)

		if(i!==-1) list.splice(i,1)
	})
}
//@todo if child items are marked uncomplete, 
	//go through their parents & mark them uncomplete as well
//@todo what should happen if a parent is uncompleted?
	//should all of its children be uncompleted as well?
logic.repeat=(state,...ids)=>ids.forEach(id=>state.file.data[id].complete=false)
logic.shuffle=(state,id=logic.listLowest(state))=>util.shuffle(state.file.data[id].list)
logic.toggleSelect=function(state,id)
{//@todo limit selection to one list 
	//or disable delete button if items on multiple levels are selected?
	const i=state.view.selected.indexOf(id)
	i!==-1?state.view.selected.splice(i,1):state.view.selected.push(id)
}
input.add=function(state)
{
	logic.itemAdd(state,logic.item(),logic.listLowest(state))
}
input.backOrOpts=function(state,evt)
{
	(state.view.path.length?input.back:input.opts)(state,evt)
}
input.back=logic.back
input.blur=function(state,{target})
{
	const
	{innerText:text}=target,
	{id}=target.parentElement

	if(util.empty(text))
	{
		if(util.empty(state.file.data[id].text)) logic.remove(state,id)
		else target.innerHTML=state.file.data[id].text
		//previous line is necessary as the text has not changed 
			//in the virtual dom & so it will not get re-rendered
	}
	else
	{
		const
		[val,...vals]=util.txt2txts(text),
		parentId=logic.parent(state,id),
		childIndex=state.file.data[parentId].list.indexOf(id)
	
		target.innerHTML=val
		logic.itemUpdate(state,id,{text:val})
	
		vals.forEach((text,i)=>logic.itemAdd(state,logic.item({text}),parentId,childIndex+i+1))	
	}

	logic.edit(state)

	//if list is empty, go back (no bugs on empty index list)
	if(!state.file.data[logic.listLowest(state)].list.length) logic.back(state)
}
input.complete=state=>logic.complete(state)
input.delete=function(state)
{
	//remove deleted items from path
	const
	indexes=state.view.selected
			.map(id=>state.view.path.indexOf(id))
			.filter(i=>i!==-1),
	i=indexes.length?Math.min(...indexes):-1

	if(i!==-1) state.view.path=state.view.path.slice(0,i)

	state.view.selected.forEach(id=>logic.remove(state,id))

	logic.deselectAll(state)
}
input.download=function(state)
{
	const clone=util.clone(state.file)
	delete clone.id

	const
	file=new Blob([JSON.stringify(clone)],{type:'text/plain'}),
	download=clone.meta.name,
	href=URL.createObjectURL(file),
	link=Object.assign(document.createElement('a'),{download,href})

	document.body.appendChild(link)
	link.click()
	link.remove()
}
input.deselect=logic.deselectAll
input.edit=function(state)
{
	const id=state.view.selected[0]
	logic.deselectAll(state)
	logic.edit(state,id)
}
input.move=logic.move
input.moveHere=function(state)
{//@todo move state assignments into logic
	const
	children=state.view.selected.slice(),
	parent=state.view.move.slice(-1),
	//made sure state.view.path does not have moved items
	i=state.view.path.findIndex(id=>children.includes(id))

	if(i!==-1) state.view.path=state.view.path.slice(0,i)

	logic.deselectAll(state)
	logic.moveItems(state,parent,children)
	state.view.move=[]//@todo move into logic
}
input.open=function(state,{target})
{
	const
	{id}=target,
	path=logic.path(state)

	if(target.querySelector('[contenteditable]')) return
	//@todo merge open & openToggle? 
		//if so, will need check if item is open before addeing a new item to 
		//an empty parent list
	if(path.indexOf(id)!==-1) return logic.openToggle(state,id)

	logic.open(state,id)

	if(!state.file.data[id].list.length) input.add(state)
}
input.opts=function(state,evt)
{
	console.log('options menu')
}
input.repeat=function(state)
{
	if(state.view.selected.length)
	{
		logic.repeat(state,...state.view.selected)
		logic.deselectAll(state)
	}
	else
	{
		const completed=state.file.data[logic.listLowest(state)].list
		.filter(id=>state.file.data[id].complete)
		logic.repeat(state,...completed)
	}	
}
input.shuffle=state=>logic.shuffle(state)
input.toggleSelect=function(state,{target})
{
	if(logic.mode(state)==='move') input.open(state,{target:target.parentElement})
	else logic.toggleSelect(state,target.parentElement.id)
}
output.header=function(state)
{
	const
	style=`background:${state.view.theme[0]};`,
	fn=	logic.mode(state)==='move'?'optsMove':
		!state.view.selected.length?'optsList':
		'optsItem',
	btns=output[fn](state)

	return v('header',{on:{pointerup:evt=>input(state,evt)},style},...btns)
}
output.item=function(state,opened,id,color)
{
	const
	item=state.file.data[id],
	//@todo id attr could be an issue if child can have multiple parents 
		//& thus show up multiple times
	attrs={data:{pointerup:'open'},id,on:{},style:`background-color:${color};`},
	attrsDesc={data:{},on:{}}

	if(id===opened) attrs.data.opened=true

	if(id===state.view.edit)
	{
		attrsDesc.contenteditable=true
		attrsDesc.on.render=({target})=>target.focus()
		attrsDesc.on.blur=evt=>input.blur(state,evt)
	}
	else if(state.view.selected.includes(id)) attrs.data.selected=true

	if(item.complete) attrsDesc.data.completed=true
	//progress bars/icon text//@todo clean up
	const
	done=	item.complete?1:
			!item.list.length?0:
			item.list
			.map(id=>state.file.data[id])
			.filter(item=>item.complete)
			.length/item.list.length,
	percent=done*100,
	icon=	item.complete?'complete':
			item.list.length===0?'+':
			done?item.list
				.map(id=>state.file.data[id])
				.filter(item=>item.complete)
				.length+'/'+item.list.length:
			item.list.length

	attrsDesc.style=`background-image:linear-gradient(to right,transparent ${percent}%, #0003 ${percent}%)`

	return v('li',attrs,
		v('button.icon',{data:{pointerup:'toggleSelect'}},icon),
		v('span.desc',attrsDesc,item.text)
	)
}
output.list=function(state,filter,id,i,path)
{
	const
	item=state.file.data[id],
	opened=path[i+1],
	list=item.list.filter(x=>!!x),
	//ignore the first item as that goes to the header
	theme=util.themeGradient(state.view.theme,list.length+1).slice(1),
	items=item.list
	.filter(x=>!!x)
	.filter(filter)
	.map((id,i)=>output.item(state,opened,id,theme[i]))

	return v('ul',{},...items)
}
output.optsItem=function(state)
{
	const
	{length}=state.view.selected,
	edit=length===1?',edit':'',
	anyDone=state.view.selected.some(util.curry(logic.isComplete,state)),
	repeat=anyDone?'repeat,':'',
	btns='complete,delete,'+repeat+'move,deselect'+edit

	return btns.split(',').map(act=>v('button',{data:{pointerup:act}},act))
}
output.optsList=function(state)
{
	const
	mode=logic.mode(state),
	path=logic.path(state).filter(x=>!!x),
	showBack=mode==='move'||path.length>1,
	placeholder=showBack?'/'+path.slice(1).map(id=>state.file.data[id].text).join('/')+'/':'search',
	{list}=state.file.data[logic.listLowest(state)]||{list:[]},
	anyDone=list.some(util.curry(logic.isComplete,state)),
	repeat=anyDone?v('button',{data:{pointerup:'repeat'}},'repeat'):false

	return [
		v('button',{data:{pointerup:'backOrOpts'}},showBack?'<':'='),
		v('input.search',{placeholder,type:'text'}),
		repeat,
		v('button',{data:{pointerup:'shuffle'}},'shuffle'),
		v('button',{data:{pointerup:'download'}},'v'),
		v('button',{data:{pointerup:'add'}},'+')
	]
	.filter(x=>!!x)
}
output.optsMove=function(state)
{
	const
	path=logic.path(state).filter(x=>!!x),
	placeholder='/'+path.slice(1).map(id=>state.file.data[id].text).join('/')+'/'

	return [//@todo make a ligature named back that is an arrow pointing left
		v('button',{data:{pointerup:'backOrOpts'}},'<'),
		v('input.search',{placeholder,type:'text'}),
		v('button',{data:{pointerup:'moveHere'}},'complete')
		//@todo add ligature for check
	]
	.filter(x=>!!x)
}
output.render=function(state)
{
	const
	move=state.view.move.filter(x=>!!x),
	[pointerup,mkList]=[input,output.list].map(fn=>util.curry(fn,state)),
	[path,filter]=move.length?[move,id=>!state.view.selected.includes(id)]:[state.view.path,()=>true],
	lists=path.filter(x=>!!x).map(util.curry(mkList,filter)),
	main=v('main',{data:{view:state.view.layout},on:{pointerup}},...lists)

	return [output.header(state),main]
}