const fs = require('fs');

const targetFile = 'c:\\Users\\Oxfam\\Documents\\clubManager-V3\\backend\\src\\modules\\store\\presentation\\controllers\\__tests__\\StoreController.test.ts';
let content = fs.readFileSync(targetFile, 'utf8');

// Add test for actif=false in getArticles
const getArticlesFalse = `      it('should handle actif param = 0', async () => {
        req.query = { actif: '0' };
        mockArticleRepo.findAll.mockResolvedValueOnce({ articles: [], total: 0 });
        await controller.getArticles(req as any, res as Response);
        expect(mockArticleRepo.findAll).toHaveBeenCalledWith(expect.objectContaining({ actif: false }));
      });`;
content = content.replace("      it('should handle errors', async () => {\\n        mockArticleRepo.findAll.mockRejectedValueOnce", getArticlesFalse + "\\n      it('should handle errors', async () => {\\n        mockArticleRepo.findAll.mockRejectedValueOnce");

// Add test for mailto url in deleteImage to hit line 416
const deleteImageMailto = `      it('should hit fallback return pathname in URL extraction', async () => {
        req.params = { articleId: '1', imageId: '2' };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        mockArticleRepo.deleteImage.mockResolvedValueOnce('mailto:test@example.com');
        mockStorageService.delete.mockResolvedValueOnce(undefined);
        await controller.deleteImage(req as any, res as Response);
        expect(mockStorageService.delete).toHaveBeenCalledWith('test@example.com');
      });`;
content = content.replace("      it('should handle unparseable URLs', async () => {", deleteImageMailto + "\\n      it('should handle unparseable URLs', async () => {");

// Add test for non-Error catch in ArticleController getArticles, etc.
const nonErrorCatch = [
  {
    search: "      it('should handle errors', async () => {\\n        mockArticleRepo.findAll.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.getArticles(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });",
    replace: "      it('should handle errors', async () => {\\n        mockArticleRepo.findAll.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.getArticles(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });\\n      it('should handle non-Error throws', async () => {\\n        mockArticleRepo.findAll.mockRejectedValueOnce('DB Error');\\n        await controller.getArticles(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });"
  },
  {
    search: "      it('should handle errors', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.getArticleById(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });",
    replace: "      it('should handle errors', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.getArticleById(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });\\n      it('should handle non-Error throws', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce('DB Error');\\n        await controller.getArticleById(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });"
  },
  {
    search: "      it('should handle errors', async () => {\\n        req.body = { nom: 'A', prix: 10 };\\n        mockArticleRepo.create.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.createArticle(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });",
    replace: "      it('should handle errors', async () => {\\n        req.body = { nom: 'A', prix: 10 };\\n        mockArticleRepo.create.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.createArticle(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });\\n      it('should handle non-Error throws', async () => {\\n        req.body = { nom: 'A', prix: 10 };\\n        mockArticleRepo.create.mockRejectedValueOnce('DB Error');\\n        await controller.createArticle(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });"
  },
  {
    search: "      it('should handle errors', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.updateArticle(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });",
    replace: "      it('should handle errors', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.updateArticle(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });\\n      it('should handle non-Error throws', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce('DB Error');\\n        await controller.updateArticle(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });"
  },
  {
    search: "      it('should handle errors', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.deleteArticle(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });",
    replace: "      it('should handle errors', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.deleteArticle(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });\\n      it('should handle non-Error throws', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce('DB Error');\\n        await controller.deleteArticle(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });"
  },
  {
    search: "      it('should handle errors', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.toggleArticle(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });",
    replace: "      it('should handle errors', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.toggleArticle(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });\\n      it('should handle non-Error throws', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce('DB Error');\\n        await controller.toggleArticle(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });"
  },
  {
    search: "      it('should handle errors', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.uploadImage(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });",
    replace: "      it('should handle errors', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.uploadImage(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });\\n      it('should handle non-Error throws', async () => {\\n        req.params = { id: '1' };\\n        mockArticleRepo.findById.mockRejectedValueOnce('DB Error');\\n        await controller.uploadImage(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });"
  },
  {
    search: "      it('should handle errors', async () => {\\n        req.params = { articleId: '1', imageId: '2' };\\n        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.deleteImage(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });",
    replace: "      it('should handle errors', async () => {\\n        req.params = { articleId: '1', imageId: '2' };\\n        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));\\n        await controller.deleteImage(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });\\n      it('should handle non-Error throws', async () => {\\n        req.params = { articleId: '1', imageId: '2' };\\n        mockArticleRepo.findById.mockRejectedValueOnce('DB Error');\\n        await controller.deleteImage(req as any, res as Response);\\n        expect(res.status).toHaveBeenCalledWith(500);\\n      });"
  }
];

nonErrorCatch.forEach(r => {
  content = content.replace(r.search, r.replace);
});

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Fixed branches');
