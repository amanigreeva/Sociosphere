const client = require('prom-client');

// Create a Registry
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
    app: 'sociosphere-backend'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Define Custom Metrics

// Counter for total messages sent
const messagesSent = new client.Counter({
    name: 'messages_sent_total',
    help: 'Total number of private messages sent',
    labelNames: ['status'] // e.g., 'success', 'failed'
});

// Counter for notifications created
const notificationsCreated = new client.Counter({
    name: 'notifications_created_total',
    help: 'Total number of notifications created',
    labelNames: ['type'] // e.g., 'like', 'comment', 'follow'
});

// Register custom metrics
register.registerMetric(messagesSent);
register.registerMetric(notificationsCreated);

module.exports = {
    register,
    messagesSent,
    notificationsCreated
};
