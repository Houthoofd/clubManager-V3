const fs = require('fs');

const targetFile = 'c:\\Users\\Oxfam\\Documents\\clubManager-V3\\backend\\src\\modules\\store\\presentation\\controllers\\__tests__\\StoreController.test.ts';
let content = fs.readFileSync(targetFile, 'utf8');

// Replace the relative URL with an absolute URL
content = content.replace(
  /url: '\/uploads\/articles\/uuid\.jpg'/g,
  "url: 'http://localhost:3000/uploads/articles/uuid.jpg'"
);

// We should also test a case where `new URL` throws? No, `new URL('invalid')` throws and returns null, we already have a test for unparseable URLs.
// Let's add non-Error catch handlers for Category, Size, Article, so that we reach 100% lines/branches.
// In ArticleController, we have `res.status(500).json({ success: false, message: msg })`. We can just test rejecting with strings.

// In CategoryController, we have uncovered 63,99,138,169,199 which are the non-Error catch blocks.
// I already added them but let's check. 
// "should handle non-Error throw" is present in CategoryController getCategories! But not for getCategoryById, create, update, delete, reorder.
// I'll just append them to the file.

const replacements = [
  {
    search: `      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getCategoryById(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`,
    replace: `      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getCategoryById(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
      it('should handle non-Error throw', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockRejectedValueOnce('Some error');
        await controller.getCategoryById(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`
  },
  {
    search: `      it('should handle errors', async () => {
        req.body = { nom: 'Cat1' };
        mockCategoryRepo.create.mockRejectedValueOnce(new Error('DB Error'));
        await controller.createCategory(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`,
    replace: `      it('should handle errors', async () => {
        req.body = { nom: 'Cat1' };
        mockCategoryRepo.create.mockRejectedValueOnce(new Error('DB Error'));
        await controller.createCategory(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
      it('should handle non-Error throw', async () => {
        req.body = { nom: 'Cat1' };
        mockCategoryRepo.create.mockRejectedValueOnce('Some error');
        await controller.createCategory(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`
  },
  {
    search: `      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.updateCategory(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`,
    replace: `      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.updateCategory(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
      it('should handle non-Error throw', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockRejectedValueOnce('Some error');
        await controller.updateCategory(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`
  },
  {
    search: `      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.deleteCategory(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`,
    replace: `      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.deleteCategory(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
      it('should handle non-Error throw', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockRejectedValueOnce('Some error');
        await controller.deleteCategory(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`
  },
  {
    search: `      it('should handle errors', async () => {
        req.body = { categories: [{ id: 1, ordre: 2 }] };
        mockCategoryRepo.reorder.mockRejectedValueOnce(new Error('DB Error'));
        await controller.reorderCategories(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`,
    replace: `      it('should handle errors', async () => {
        req.body = { categories: [{ id: 1, ordre: 2 }] };
        mockCategoryRepo.reorder.mockRejectedValueOnce(new Error('DB Error'));
        await controller.reorderCategories(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
      it('should handle non-Error throw', async () => {
        req.body = { categories: [{ id: 1, ordre: 2 }] };
        mockCategoryRepo.reorder.mockRejectedValueOnce('Some error');
        await controller.reorderCategories(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`
  },
  {
    search: `      it('should handle errors', async () => {
        mockSizeRepo.findAll.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getSizes(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`,
    replace: `      it('should handle errors', async () => {
        mockSizeRepo.findAll.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getSizes(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
      it('should handle non-Error throw', async () => {
        mockSizeRepo.findAll.mockRejectedValueOnce('Some error');
        await controller.getSizes(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`
  },
  {
    search: `      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getSizeById(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`,
    replace: `      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getSizeById(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
      it('should handle non-Error throw', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockRejectedValueOnce('Some error');
        await controller.getSizeById(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`
  },
  {
    search: `      it('should handle errors', async () => {
        req.body = { nom: 'L' };
        mockSizeRepo.create.mockRejectedValueOnce(new Error('DB Error'));
        await controller.createSize(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`,
    replace: `      it('should handle errors', async () => {
        req.body = { nom: 'L' };
        mockSizeRepo.create.mockRejectedValueOnce(new Error('DB Error'));
        await controller.createSize(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
      it('should handle non-Error throw', async () => {
        req.body = { nom: 'L' };
        mockSizeRepo.create.mockRejectedValueOnce('Some error');
        await controller.createSize(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`
  },
  {
    search: `      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.updateSize(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`,
    replace: `      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.updateSize(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
      it('should handle non-Error throw', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockRejectedValueOnce('Some error');
        await controller.updateSize(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`
  },
  {
    search: `      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.deleteSize(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`,
    replace: `      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.deleteSize(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
      it('should handle non-Error throw', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockRejectedValueOnce('Some error');
        await controller.deleteSize(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });`
  }
];

// Apply replacements for ArticleController errors too!
// Wait, we need to do it globally for all "it('should handle errors', async () => {" in ArticleController too if there are coverage gaps. 
// ArticleController's uncovered lines: 223-226 (which is catch block for storage delete), 379 (which is catch block for storage delete in deleteImage), 416 (extractStorageKey catch block).
// Let's add a test for non-Error catch in deleteImage:
const articleDeleteImage = `      it('should handle non-error throw in storage delete', async () => {
        req.params = { articleId: '1', imageId: '2' };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        mockArticleRepo.deleteImage.mockResolvedValueOnce('http://localhost:3000/uploads/articles/uuid.jpg');
        mockStorageService.delete.mockRejectedValueOnce('Non-error string');

        await controller.deleteImage(req as any, res as Response);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });`;

content = content.replace("      it('should handle unparseable URLs'", articleDeleteImage + "\\n      it('should handle unparseable URLs'");


const articleDeleteArticle = `      it('should handle non-error throw in storage delete during deleteArticle', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1, images: [{ url: 'http://localhost:3000/uploads/articles/uuid.jpg' }] } as any);
        mockStorageService.delete.mockRejectedValueOnce('Non-error string');
        
        await controller.deleteArticle(req as any, res as Response);
        
        expect(mockArticleRepo.delete).toHaveBeenCalledWith(1);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });`;

content = content.replace("      it('should handle errors', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.deleteArticle", articleDeleteArticle + "\\n      it('should handle errors', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.deleteArticle");


replacements.forEach(r => {
  content = content.replace(r.search, r.replace);
});

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Fixed URLs and added non-error catch tests.');
