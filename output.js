output.item=function(state,selected,id)
{
	const
	item=state.file.data[id],
	icon=item.list.length||'+',
	attrs={data:{pointerup:'open'},id,on:{}},
	attrsDesc={on:{}}
	//@todo id could be an issue if child can have multiple parents

	if(id===selected) attrs.data.selected=true
	if(id===state.view.edit)
	{
		attrsDesc.contenteditable=true
		attrsDesc.on.render=({target})=>target.focus()
		attrsDesc.on.blur=evt=>input.blur(state,evt)
	}

	return v('li',attrs,
		v('span.icon',{data:{pointerup:'itemOpts'}},icon),
		v('span.desc',attrsDesc,item.text)
	)
}
output.list=function(state,id,i,path)
{
	const
	item=state.file.data[id],
	selected=path[i+1],
	items=util.mapEmpty(item.list,id=>output.item(state,selected,id))

	return v('ul',{},...items)
}
output.render=function(state)
{
	const
	[pointerup,mkList]=[input,output.list].map(fn=>util.curry(fn,state)),
	lists=util.mapEmpty(['index',...state.view.path],mkList)
	showBack=!!state.view.path.length,
	placeholder=showBack?state.view.path.map(id=>state.file.data[id].text).join('/')+'/':'search'

	return [v('header',{on:{pointerup}},
			v('button',{data:{pointerup:'backOrOpts'}},showBack?'<':'='),
			v('input',{placeholder,type:'text'}),
			v('button',{data:{pointerup:'add'}},'+')
		),
		v('main',{on:{pointerup}},...lists)
	]
}