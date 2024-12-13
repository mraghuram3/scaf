/// set Cookies with optional expiration default expiration is 1 days
export const setCookie = (name: string, value: string, expiration?: number) => {
    const date = new Date();
    date.setTime(date.getTime() + (expiration || 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value}; path=/; expires=${date.toUTCString()}`;
};

/// delete Cookies
export const deleteCookie = (name: string) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
};
