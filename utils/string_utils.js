const normalize = s => s.toString().toLowerCase().split(' ').join('').normalize('NFD')
.replace(/[\u0300-\u036f]/g, '')
.replace(/đ/g, 'd').replace(/Đ/g, 'D');

module.exports = { normalize }