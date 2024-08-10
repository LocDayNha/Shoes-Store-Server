const orderService=require('./OrderService');


const  getTotalAmountByUserAndStatus= async(req, res) =>{
  const { userId, isPaid, fromDate, toDate } = req.query;
  try {
    const totalAmount = await orderService.calculateTotalAmountByUserAndStatus(userId, isPaid, fromDate, toDate);
    res.json({ totalAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getTotalAmountByMonthAndStatus=async(req, res)=> {
  const { userId, isPaid } = req.query;
  try {
    const totalAmountByMonth = await orderService.calculateTotalAmountByMonthAndStatus(userId, isPaid);
    res.json({ totalAmountByMonth });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const  getDailyPayments= async(req, res) =>{
  const { userId, isPaid, fromDate, toDate } = req.body;
  try {
    const totalAmount = await orderService.getDailyPayments(userId, isPaid, fromDate, toDate);
    res.json({ totalAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const  getProductCountByDay= async(req, res) =>{
  const { userId, fromDate, toDate } = req.query;
  try {
    const productCount = await orderService.getProductCountByDay(userId, fromDate, toDate);
    res.json({ productCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
module.exports = {
    getTotalAmountByUserAndStatus,
    getTotalAmountByMonthAndStatus,
    getDailyPayments,
    getProductCountByDay
  };