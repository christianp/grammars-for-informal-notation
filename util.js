Numbas.queueScript('base',['jquery'],function() {});
function ready() {
    return new Promise(function(resolve,reject) {
        Numbas.queueScript('go',['jme'],function() {
            if(document.readyState == 'complete' || document.readyState == 'loaded') {
                resolve()
            } else {
                document.addEventListener('DOMContentLoaded',resolve);
            }
        })
    })
}

