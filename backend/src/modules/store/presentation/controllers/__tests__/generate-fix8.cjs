const fs = require('fs');

const targetFile = 'c:\\Users\\Oxfam\\Documents\\clubManager-V3\\backend\\src\\modules\\store\\presentation\\controllers\\__tests__\\StoreController.test.ts';
let content = fs.readFileSync(targetFile, 'utf8');

// We will manually append tests to each describe block using string replacements or we can just find:
// `      it('should handle errors', async () => {`
// and carefully replace the specific ones.
// Let's replace the whole ArticleController block's `it('should handle errors', async () => {`
// Actually, it's easier to find `expect(res.status).toHaveBeenCalledWith(500);\n      });`

let articleControllerIndex = content.indexOf("describe('ArticleController', () => {");
if (articleControllerIndex === -1) {
  console.log('ArticleController not found');
} else {
  let articleContent = content.substring(articleControllerIndex);
  
  // Replace each `new Error('DB Error')` with a duplicated block that throws a string
  // For findAll, findById, create, update, delete, toggleActive, upload, deleteImage
  
  articleContent = articleContent.replace(/it\('should handle errors', async \(\) => \{([\s\S]*?)mockArticleRepo\.(.*?)\.mockRejectedValueOnce\(new Error\('DB Error'\)\);([\s\S]*?)expect\(res\.status\)\.toHaveBeenCalledWith\(500\);\n      \}\);/g, 
  (match, p1, p2, p3) => {
    return match + `\n      it('should handle non-Error throws', async () => {${p1}mockArticleRepo.${p2}.mockRejectedValueOnce('DB Error');${p3}expect(res.status).toHaveBeenCalledWith(500);\n      });`;
  });

  content = content.substring(0, articleControllerIndex) + articleContent;
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Fixed ArticleController non-Error catch branches.');
