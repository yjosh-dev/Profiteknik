
export const validateUsernameInput = (username: string) => {
    return username.trim().length > 4 
}

export const validatePasswordInput = (password: string) => {
    return password.trim().length > 4
}