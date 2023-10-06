import dataSource, { initDB } from '../dist/src/db/dataSource.js'
import { creatOrganizationAdmin } from '../dist/src/controllers/organizationAdmin.js';

beforeAll(async () => {
    await initDB();
});

afterAll(async () => {
    await dataSource.destroy();
});

const tmpData = {
    "name": "Sarah Abu Irmaileh",
    "email": "tamimitarteel27@gamil.com",
    "password": "toto2003",
    "organizationId": "e4b41a72-2abe-459c-8657-7a09956f1243"
};

describe("create an organization admin", () => {
    let data;
    beforeAll(async () => {
        data = await creatOrganizationAdmin({name: tmpData.name, email: tmpData.email, password: tmpData.password, organizationId: tmpData.organizationId});
    })

    it("returns a success response", async () => {
        expect(data.name).toBe('Sarah Abu Irmaileh');
    })
})
