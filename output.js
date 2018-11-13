output.header=function(state)
{
	const
	showBack=!!state.view.path.length,
	placeholder=showBack?state.view.path.map(id=>state.file.data[id].text).join('/')+'/':'search',
	{length}=state.view.selected,
	//show edit button if only 1 item is selected
	filter=length===1?()=>true:x=>x!=='edit',
	btns=!length?
	[
		v('button',{data:{pointerup:'backOrOpts'}},showBack?'<':'='),
		v('input',{placeholder,type:'text'}),
		v('button',{data:{pointerup:'add'}},'+')
	]:
	'complete,delete,repeat,edit'
	.split(',')
	.filter(filter)
	.map(act=>v('button',{data:{pointerup:act}},act))
	
	return v('header',{on:{pointerup:evt=>input(state,evt)}},...btns)
}
output.item=function(state,opened,id)
{
	const
	item=state.file.data[id],
	icon=item.list.length||'+',
	//@todo id attr could be an issue if child can have multiple parents 
		//& thus show up multiple times
	attrs={data:{pointerup:'open'},id,on:{}},
	attrsDesc={on:{}}

	if(id===opened) attrs.data.opened=true

	if(id===state.view.edit)
	{
		attrsDesc.contenteditable=true
		attrsDesc.on.render=({target})=>target.focus()
		attrsDesc.on.blur=evt=>input.blur(state,evt)
	}
	else if(state.view.selected.includes(id)) attrs.data.selected=true

	return v('li',attrs,
		v('span.icon',{data:{pointerup:'toggleSelect'}},icon),
		v('span.desc',attrsDesc,item.text)
	)
}
output.list=function(state,id,i,path)
{
	const
	item=state.file.data[id],
	opened=path[i+1],
	items=util.mapEmpty(item.list,id=>output.item(state,opened,id))

	return v('ul',{},...items)
}
output.render=function(state)
{
	const
	[pointerup,mkList]=[input,output.list].map(fn=>util.curry(fn,state)),
	lists=util.mapEmpty(['index',...state.view.path],mkList),
	main=v('main',{data:{view:'list'},on:{pointerup}},...lists)

	return [output.header(state),main]
}