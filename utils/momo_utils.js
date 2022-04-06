const createRequestId = (username) => {
    const str_part = 'fitness-mall-';
    const unique_part = Date.now();
    return str_part + username + unique_part;
}

module.exports = {createRequestId};

