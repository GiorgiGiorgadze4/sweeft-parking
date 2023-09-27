import dataSource from '../config/db';
import { User } from '../models/user.model';

export const UserRepository = dataSource.getRepository(User).extend({
    // Custom methods go here
});
