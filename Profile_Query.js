const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3307;
const jwt = require('jsonwebtoken');
const secret = 'Software_Dev';

// Create a connection to your MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'bank',
  password: 'admin1',
  database: 'myshop3',
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to the database');
});

// GENERATE TOKEN FOR TESTING
const payload = {
  uid: "user1@example.com", 
  uid: 2, 
};

const token = jwt.sign(payload, secret, { expiresIn: '1h' });
console.log(token);


// TOKEN FUNCTION
function tokenCheck (req, res, next) {
  try{
      const token = req.headers.authorization;

      jwt.verify(token, secret, (err, decode) => {
        if (err) {
          // Token is not valid or null
          //req.isTokenValid = false;
        } else {
          // Token is valid
          //req.isTokenValid = true;
          req.user = decode;
        }
        next();
      })
      

  } catch (error){
      console.log(error)
      res.json({
          error: error.message
      })
  }
};


// OWN PROFILE GET
app.get('/profile/own/:id', tokenCheck, (req, res) => {
  // Take uid from URL to filter
  const userId = req.params.id;

  const responseData = {};

  // Query for profile data
  const queryPD = `
    SELECT user_name, review_score, boosting_success, selling_success
    FROM users 
    WHERE uid = ?`;
  connection.query(queryPD, [userId], (err, results1) => {
    if (err) {
      console.error('Error querying profile data:', err);
      res.status(500).json({ error: 'Failed to fetch profile data' });
      return;
    }
    responseData.profileData = results1;
  });

  if (req.user.uid == userId) {
        // FOR OWN PROFILE ONLY

        // Query for accounts' own profile bought but not confirmed
        const queryAP_OP = `
        SELECT 
          SellOrder.image, 
          SellOrder.order_name, 
          SellOrder.price, 
          SellOrder.status, 
          users.user_name
        FROM SellOrder 
        JOIN users ON users.uid = SellOrder.bid
        WHERE users.uid = ?`;
        connection.query(queryAP_OP, [userId], (err, results2) => {
          if (err) {
            console.error('Error querying accounts\' own profile bought but not confirmed:', err);
            res.status(500).json({ error: 'Failed to fetch accounts\' own profile bought but not confirmed' });
            return;
          }
          responseData.OwnBoughtNotConfirmed = results2;
        });


        // Query for accounts' own profile sold but not confirmed
        const querySP_OP = `
        SELECT 
          SellOrder.image, 
          SellOrder.order_name, 
          SellOrder.status, 
          SellOrder.price, 
          users.user_name
        FROM SellOrder 
        JOIN users ON users.uid = SellOrder.sid  
        WHERE users.uid = ?`;
        connection.query(querySP_OP, [userId], (err, results3) => {
          if (err) {
            console.error('Error querying accounts\' own profile sold but not confirmed:', err);
            res.status(500).json({ error: 'Failed to fetch accounts\' own profile sold but not confirmed' });
            return;
          }
          responseData.OwnSoldNotConfirmed = results3;
        });


        // Query for accounts' own profile being boosted
        const queryBB_OP = `
        SELECT 
            BoosterDetail.promote_pic, 
            BoosterDetail.tier, 
            BoosterDetail.max_tier, 
            (SELECT user_name FROM users WHERE BoostOrder.boid = users.uid) as user_name, 
            BoostOrder.status
          FROM BoostOrder
          JOIN users ON users.uid = BoostOrder.eid
          JOIN BoosterDetail ON BoosterDetail.uid = BoostOrder.boid
          WHERE users.uid = ?        
        `;
        connection.query(queryBB_OP, [userId], (err, results4) => {
          if (err) {
            console.error('Error querying accounts\' own profile being boosted:', err);
            res.status(500).json({ error: 'Failed to fetch accounts\' own profile being boosted' });
            return;
          }
          responseData.OwnBoosted = results4;
        });


        // Query for accounts' own profile is boosting
        const queryBP_OP = `
        SELECT 
          BoosterDetail.promote_pic, 
          BoostOrder.status, 
          BoosterDetail.tier, 
          BoosterDetail.max_tier, 
          (SELECT user_name FROM users WHERE BoostOrder.eid = users.uid) as user_name
        FROM BoostOrder
        JOIN users ON users.uid = BoostOrder.boid
        JOIN BoosterDetail ON BoosterDetail.uid = users.uid
        WHERE users.uid = ?`;
        connection.query(queryBP_OP, [userId], (err, results5) => {
          if (err) {
            console.error('Error querying accounts\' own profile is boosting:', err);
            res.status(500).json({ error: 'Failed to fetch accounts\' own profile is boosting' });
            return;
          }
          responseData.OwnBoosting = results5;
        });

        // Query for history of own profile
        const queryHS_OP = `
          (SELECT 
            SellOrder.image, 
            SellOrder.order_name, 
            SellOrder.price, 
            'ส่งมอบไอดีเรียบร้อยแล้ว' as type, 
            (SELECT user_name FROM users WHERE SellOrder.bid = users.uid) as user_name, 
            SellOrder.datetime as date_time
          FROM SellOrder 
          JOIN users ON users.uid = SellOrder.sid
          WHERE users.uid = ? AND SellOrder.status = ?)

          UNION ALL

          (SELECT 
            SellOrder.image, 
            SellOrder.order_name, 
            SellOrder.price, 
            'ได้รับไอดีเรียบร้อยแล้ว' as type, 
            users.user_name, 
            SellOrder.datetime as date_time
          FROM SellOrder 
          JOIN users ON users.uid = SellOrder.bid
          WHERE users.uid = ? AND SellOrder.status = ?)
          
          UNION ALL
          
          (SELECT 
            BoosterDetail.promote_pic, 
            users.user_name, 
            BoostOrder.price, 
            'ส่งงานเรียบร้อยแล้ว' as type, 
            (SELECT user_name FROM users WHERE BoostOrder.eid = users.uid) as user_name, 
            BoostOrder.datetime as date_time
          FROM BoostOrder
          JOIN users ON users.uid = BoostOrder.boid
          JOIN BoosterDetail ON BoosterDetail.uid = users.uid
          WHERE users.uid = ? AND BoostOrder.status = ?)

          UNION ALL

          (SELECT 
            BoosterDetail.promote_pic, 
            (SELECT user_name FROM users WHERE BoostOrder.boid = users.uid) as user_name, 
            BoostOrder.price, 
            'ได้รับการบูสเรียบร้อยแล้ว' as type, 
            users.user_name, 
            BoostOrder.datetime as date_time
          FROM BoostOrder
          JOIN users ON users.uid = BoostOrder.eid
          JOIN BoosterDetail ON BoosterDetail.uid = BoostOrder.boid
          WHERE users.uid = ? AND BoostOrder.status = ?)
          
          ORDER BY date_time
          `;
          connection.query(queryHS_OP, [userId, "Completed", userId, "Completed", userId, "Completed", userId, "Completed"], (err, results6) => {
            if (err) {
              console.error('Error querying account history:', err);
              res.status(500).json({ error: 'Failed to fetch account history' });
              return;
            }
            responseData.OwnHistory = results6;
          
          res.json(responseData);
          }
        );
      } 

      }
);

// OTHER PROFILE GET
app.get('/profile/:id', (req, res) => {
    // Take uid from URL to filter
    const userId = req.params.id;
  
    const responseData = {};
  
    // Query for profile data
    const queryPD = `
      SELECT user_name, review_score, boosting_success, selling_success
      FROM users 
      WHERE uid = ?`;
    connection.query(queryPD, [userId], (err, results1) => {
      if (err) {
        console.error('Error querying profile data:', err);
        res.status(500).json({ error: 'Failed to fetch profile data' });
        return;
      }
      responseData.profileData = results1;
    });
  
      // FOR OTHER PROFILE ONLY
  
      // Query for account being sold of the profile
      const querySP = `
      SELECT 
        SellOrder.image, 
        SellOrder.order_name, 
        SellOrder.status, 
        SellOrder.price, 
        users.user_name
      FROM SellOrder 
      JOIN users ON users.uid = SellOrder.sid  
      WHERE users.uid = ?`;
    connection.query(querySP, [userId], (err, results2) => {
      if (err) {
        console.error('Error querying account being sold:', err);
        res.status(500).json({ error: 'Failed to fetch account being sold' });
        return;
      }
      responseData.accountBeingSold = results2;
    });
  
      // Query for account being boosted of the profile
      const queryBP = `
        SELECT 
          BoosterDetail.promote_pic, 
          BoostOrder.price, 
          BoostOrder.status, 
          BoosterDetail.tier, 
          BoosterDetail.max_tier, 
          BoostOrder.datetime, 
          (SELECT user_name FROM users WHERE BoostOrder.eid = users.uid) as user_name
        FROM BoostOrder
        JOIN users ON users.uid = BoostOrder.boid
        JOIN BoosterDetail ON BoosterDetail.uid = users.uid
        WHERE users.uid = ?
        `;
        
      connection.query(queryBP, [userId], (err, results3) => {
        if (err) {
          console.error('Error querying account being boosted:', err);
          res.status(500).json({ error: 'Failed to fetch account being boosted' });
          return;
        }
        responseData.accountBeingBoosted = results3;
      });
  
        // Query for history of the profile
        const queryHS = `
          (SELECT 
            SellOrder.image, 
            SellOrder.order_name, 
            SellOrder.price, 
            'Selling' as type, 
            (SELECT user_name FROM users WHERE SellOrder.bid = users.uid) as user_name, 
            SellOrder.datetime as date_time
          FROM SellOrder 
          JOIN users ON users.uid = SellOrder.sid
          WHERE users.uid = ? AND SellOrder.status = ?)
  
          UNION ALL
  
          (SELECT 
            SellOrder.image, 
            SellOrder.order_name, 
            SellOrder.price, 
            'Buying' as type, 
            users.user_name, 
            SellOrder.datetime as date_time
          FROM SellOrder 
          JOIN users ON users.uid = SellOrder.bid
          WHERE users.uid = ? AND SellOrder.status = ?)
          
          UNION ALL
          
          (SELECT 
            BoosterDetail.promote_pic, 
            users.user_name, 
            BoostOrder.price, 
            'Boosting' as type, 
            (SELECT user_name FROM users WHERE BoostOrder.eid = users.uid) as user_name, 
            BoostOrder.datetime as date_time
          FROM BoostOrder
          JOIN users ON users.uid = BoostOrder.boid
          JOIN BoosterDetail ON BoosterDetail.uid = users.uid
          WHERE users.uid = ? AND BoostOrder.status = ?)
  
          UNION ALL
  
          (SELECT 
            BoosterDetail.promote_pic, 
            (SELECT user_name FROM users WHERE BoostOrder.boid = users.uid) as user_name, 
            BoostOrder.price, 
            'Boosted' as type, 
            users.user_name, 
            BoostOrder.datetime as date_time
          FROM BoostOrder
          JOIN users ON users.uid = BoostOrder.eid
          JOIN BoosterDetail ON BoosterDetail.uid = BoostOrder.boid
          WHERE users.uid = ? AND BoostOrder.status = ?)
          
          ORDER BY date_time
          `;
        connection.query(queryHS, [userId, "Completed", userId, "Completed", userId, "Completed", userId, "Completed"], (err, results4) => {
          if (err) {
            console.error('Error querying account history:', err);
            res.status(500).json({ error: 'Failed to fetch account history' });
            return;
          }
          responseData.accountHistory = results4;
          res.json(responseData);
        
        });
  
        }
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

