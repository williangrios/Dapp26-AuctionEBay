export function format6FirstsAnd6LastsChar(text){

    if (text === '-'){
        return text
    }else if( text =='' || text == undefined || text == null){
        return ''
    }
    let newText = text.substring(0,6)
    newText = newText + '....' + text.substring(text.length - 6);
    return newText;
}

export function toDate (dateTimestamp){
    return (new Date(parseInt(dateTimestamp) * 1000)).toLocaleString()
} 
