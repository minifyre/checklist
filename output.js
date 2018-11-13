output.render=function(state)
{
	const
	[blur,pointerup]=[input.blur,input].map(fn=>evt=>fn(state,evt)),
	lists=['index',...state.view.path]
	//an empty item exists on the end after a splice/pop call, b4 length is changed
	.filter(x=>!!x)
	.map(function(listId,i,path)
	{
		const
		item=state.file.data[listId],
		selected=path[i+1],
		items=item.list
		.filter(x=>!!x)
		.map(function(id)
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
				attrsDesc.on.blur=blur
			}

			return v('li',attrs,
				v('span.icon',{data:{pointerup:'itemOpts'}},icon),
				v('span.desc',attrsDesc,item.text)
			)
		})

		return v('ul',{},...items)
	}),
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