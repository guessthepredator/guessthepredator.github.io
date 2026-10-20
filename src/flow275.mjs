// Free Play follows the six home modes; replay remains a separate action.
const FREE_MODES=['classic','pixel','quote','ability','emoji','trivia'];
export function nextFreeMode(mode){return FREE_MODES[(FREE_MODES.indexOf(mode)+1)%FREE_MODES.length];}
export function writtenAnswerPlaceholder(question){
 if(question.category==='release')return 'Type a Season number…';
 if(question.category==='ultimates')return 'Type the Ultimate ability name…';
 if(/^how many/i.test(question.prompt||''))return 'Type a number…';
 return 'Type your answer…';
}
