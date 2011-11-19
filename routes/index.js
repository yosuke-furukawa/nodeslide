/*
 * GET home page.
 */
exports.index = function(req, res){
  if(req.params.id) {
    res.render(req.params.id, { slideId: req.params.id })
  } else {
    res.render('index', { slideId: 'default' })
  }
};
