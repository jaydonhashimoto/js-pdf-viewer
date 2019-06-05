const url = '../docs/pdf.pdf';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5,
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

//render the page
const renderPage = num => {
    // let page know that page is being rendered
    pageIsRendering = true;

    //get page
    pdfDoc.getPage(num).then(page => {
        //set scale
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        //set render context
        const renderCtx = {
            canvasContext: ctx,
            viewport
        }

        //render page with render context
        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;

            //check if page num is pending
            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        //output current page
        document.querySelector('#page-num').textContent = num;
    });

}

//check for pages rendering
const queueRenderPage = num => {
    if (pageIsRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
}

//show previous page
const showPrevPage = () => {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

//show next page
const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

//get document
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;

    document.querySelector('#page-count').textContent = pdfDoc.numPages;

    renderPage(pageNum);
})
    .catch(err => {
        //display error
        //create div element
        const div = document.createElement('div');
        //set class name 
        div.className = 'error';
        //set text node inside div to error message
        div.appendChild(document.createTextNode(err.message));
        //insert div before canvas element inside the body
        document.querySelector('body').insertBefore(div, canvas);
        //remove top bar
        document.querySelector('.top-bar').style.display = 'none';
    });

//button events
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);