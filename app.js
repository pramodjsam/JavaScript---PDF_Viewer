const url="./pdf.pdf";

let pdfDoc=null,
	pageNum=1,
	pageIsRendering=false,
	pageNumIsPending=null;

const scale=1.5,
	canvas=document.querySelector("#pdf-render"),
	ctx=canvas.getContext('2d');

const renderPage=(num)=>{
	pageIsRendering=true;

	pdfDoc.getPage(num).then((page)=>{
		console.log("page",page)
		const viewport= page.getViewport({scale});
		canvas.height=viewport.height;
		canvas.width=viewport.width;
		const renderCtx={
			canvasContext:ctx,
			viewport:viewport
		}

		page.render(renderCtx).promise.then(function(){
			pageIsRendering=false;
			if(pageNumIsPending!==null){
				renderPage(pageNumIsPending);
				pageNumIsPending=null
			}
		})
		document.querySelector(".page-num").innerHTML=num
	});
}

const queueRenderPage= function(num){
	if(pageIsRendering){
		pageNumIsPending=num
	}else{
		renderPage(num)
	}
}

const showPrevPage=function(){
	if(pageNum<=1){
		return;
	}
	pageNum--;
	queueRenderPage(pageNum)
}

const showNextPage=function(){
	if(pageNum>= pdfDoc.numPages){
		return;
	}
	pageNum++;
	queueRenderPage(pageNum)
}

pdfjsLib.getDocument(url).promise.then(function(pdfDoc_){
	pdfDoc= pdfDoc_;
	console.log("init render",pdfDoc);
	document.querySelector(".page-count").innerHTML=pdfDoc.numPages;
	renderPage(pageNum)
}).catch(function(err){
	const div=document.createElement("div");
	div.className="error";
	div.appendChild(document.createTextNode(err.message));
	document.querySelector("body").insertBefore(div,canvas);
	document.querySelector(".top-bar").style.display='none'
})

document.querySelector("#prev-page").addEventListener("click",showPrevPage);
document.querySelector("#next-page").addEventListener("click",showNextPage)
