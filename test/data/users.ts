export interface UserCredentials {
    username: string
    password: string
}

export const standardUser: UserCredentials = {
    username: 'standard_user',
    password: 'secret_sauce',
}

export const lockedOutUser: UserCredentials = {
    username: 'locked_out_user',
    password: 'secret_sauce',
}

export const problemUser: UserCredentials = {
    username: 'problem_user',
    password: 'secret_sauce',
}

export const invalidUser: UserCredentials = {
    username: 'invalid_user',
    password: 'wrong_password',
}
