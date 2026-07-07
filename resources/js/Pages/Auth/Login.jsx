import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword, privacyPolicy }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nik: '',
        password: '',
        remember: false,
    });
    const [showPrivacy, setShowPrivacy] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login — Bina Sarana Sukses" />
            
            <div className="login-wrapper">
                <div className="brand-logo">
                    <img src="/BSS-logo.svg" alt="Bina Sarana Sukses" />
                </div>
                
                <div className="login-card">
                    <h1 className="card-title">Login</h1>
                    
                    {status && (
                        <div className="alert-success">
                            {status}
                        </div>
                    )}
                    
                    <form onSubmit={submit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="nik" className="form-label">Username/NIK</label>
                            <input
                                id="nik"
                                type="text"
                                name="nik"
                                value={data.nik}
                                className="form-input"
                                autoComplete="username"
                                autoFocus
                                onChange={(e) => setData('nik', e.target.value)}
                            />
                            {errors.nik && <p className="error-msg">{errors.nik}</p>}
                        </div>
                        
                        <div className="form-group">
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="form-input"
                                placeholder="Password"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && <p className="error-msg">{errors.password}</p>}
                        </div>
                        
                        <div className="form-row">
                            <label className="remember-label">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    id="remember"
                                    checked={data.remember}
                                    className="remember-checkbox"
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="remember-text">Remember me</span>
                            </label>
                        </div>
                        
                        <button type="submit" className="submit-btn" disabled={processing}>
                            {processing ? 'Loading...' : 'Login'}
                        </button>
                        
                        
                        <div className="text-center mt-6">
                            <button type="button" onClick={() => setShowPrivacy(true)} className="privacy-link bg-transparent border-0 cursor-pointer">
                                Privacy Policy
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Privacy Policy Modal */}
            {showPrivacy && (
                <div className="privacy-modal-overlay" onClick={() => setShowPrivacy(false)}>
                    <div className="privacy-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="privacy-modal-header">
                            <h2>Privacy Policy</h2>
                            <button className="close-btn" onClick={() => setShowPrivacy(false)}>&times;</button>
                        </div>
                        <div className="privacy-modal-body">
                            {privacyPolicy ? (
                                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: privacyPolicy }} />
                            ) : (
                                <div>
                                    <p><strong>Privacy Policy</strong></p>
                                    <p>Last updated: March 14, 2023</p>
                                    <br/>
                                    <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
                                    <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.</p>
                                    <br/>
                                    <h3>Interpretation and Definitions</h3>
                                    <h4>Interpretation</h4>
                                    <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
                                    <br/>
                                    <h4>Definitions</h4>
                                    <p>For the purposes of this Privacy Policy:</p>
                                    <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                                        <li><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</li>
                                        <li><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
                                        <li><strong>Application</strong> means the software program provided by the Company downloaded by You on any electronic device, named LinovHR</li>
                                        <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to PT Linov Rocket Prestasi, Pakuwon Tower, Jl Casablanca No.Kav 88 22nd floor, Menteng Dalam, Kec. Tebet, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12870.</li>
                                        <li><strong>Country</strong> refers to: Indonesia</li>
                                        <li><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
                                        <li><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</li>
                                        <li><strong>Service</strong> refers to the Application.</li>
                                        <li><strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</li>
                                        <li><strong>Third-party Social Media Service</strong> refers to any website or any social network website through which a User can log in or create an account to use the Service.</li>
                                        <li><strong>Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</li>
                                        <li><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
                                    </ul>
                                    
                                    <br/>
                                    <h3>Collecting and Using Your Personal Data</h3>
                                    <h4>Types of Data Collected</h4>
                                    <h5>Personal Data</h5>
                                    <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>
                                    <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                                        <li>Email address</li>
                                        <li>First name and last name</li>
                                        <li>Phone number</li>
                                        <li>Address, State, Province, ZIP/Postal code, City</li>
                                        <li>Usage Data</li>
                                    </ul>

                                    <br/>
                                    <h5>Usage Data</h5>
                                    <p>Usage Data is collected automatically when using the Service.</p>
                                    <p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
                                    <p>When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.</p>
                                    <p>We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or through a mobile device.</p>

                                    <br/>
                                    <h5>Information Collected while Using the Application</h5>
                                    <p>While using Our Application, in order to provide features of Our Application, We may collect, with Your prior permission:</p>
                                    <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                                        <li>Information regarding your location</li>
                                        <li>Information from your Device's phone book (contacts list)</li>
                                        <li>Pictures and other information from your Device's camera and photo library</li>
                                    </ul>
                                    <p>We use this information to provide features of Our Service, to improve and customize Our Service. The information may be uploaded to the Company's servers and/or a Service Provider's server or it may be simply stored on Your device.</p>
                                    <p>You can enable or disable access to this information at any time, through Your Device settings.</p>

                                    <br/>
                                    <h3>Use of Your Personal Data</h3>
                                    <p>The Company may use Personal Data for the following purposes:</p>
                                    <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                                        <li>To provide and maintain our Service, including to monitor the usage of our Service.</li>
                                        <li>To manage Your Account: to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionality of the Service that are available to You as a registered user.</li>
                                        <li>For the performance of a contract: the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.</li>
                                        <li>To contact You: To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionality, products or contracted services, including the security updates, when necessary or reasonable for their implementation.</li>
                                        <li>To provide You with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such information.</li>
                                        <li>To manage Your requests: To attend and manage Your requests to Us.</li>
                                        <li>For business transfers: We may use Your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about our Service users is among the assets transferred.</li>
                                        <li>For other purposes: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products, services, marketing and your experience.</li>
                                    </ul>

                                    <br/>
                                    <p>We may share Your personal information in the following situations:</p>
                                    <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                                        <li><strong>With Service Providers:</strong> We may share Your personal information with Service Providers to monitor and analyze the use of our Service, to contact You.</li>
                                        <li><strong>For business transfers:</strong> We may share or transfer Your personal information in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.</li>
                                        <li><strong>With Affiliates:</strong> We may share Your information with Our affiliates, in which case we will require those affiliates to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or other companies that We control or that are under common control with Us.</li>
                                        <li><strong>With business partners:</strong> We may share Your information with Our business partners to offer You certain products, services or promotions.</li>
                                        <li><strong>With other users:</strong> when You share personal information or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside. If You interact with other users or register through a Third-Party Social Media Service, Your contacts on the Third-Party Social Media Service may see Your name, profile, pictures and description of Your activity. Similarly, other users will be able to view descriptions of Your activity, communicate with You and view Your profile.</li>
                                        <li><strong>With Your consent:</strong> We may disclose Your personal information for any other purpose with Your consent.</li>
                                    </ul>

                                    <br/>
                                    <h3>Retention of Your Personal Data</h3>
                                    <p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.</p>
                                    <p>The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service, or We are legally obligated to retain this data for longer time periods.</p>

                                    <br/>
                                    <h3>Transfer of Your Personal Data</h3>
                                    <p>Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from Your jurisdiction.</p>
                                    <p>Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.</p>
                                    <p>The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of Your data and other personal information.</p>

                                    <br/>
                                    <h3>Disclosure of Your Personal Data</h3>
                                    <h4>Business Transactions</h4>
                                    <p>If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
                                    
                                    <h4>Law enforcement</h4>
                                    <p>Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).</p>

                                    <h4>Other legal requirements</h4>
                                    <p>The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:</p>
                                    <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                                        <li>Comply with a legal obligation</li>
                                        <li>Protect and defend the rights or property of the Company</li>
                                        <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
                                        <li>Protect the personal safety of Users of the Service or the public</li>
                                        <li>Protect against legal liability</li>
                                    </ul>

                                    <br/>
                                    <h3>Security of Your Personal Data</h3>
                                    <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>

                                    <br/>
                                    <h3>Children's Privacy</h3>
                                    <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13 without verification of parental consent, We take steps to remove that information from Our servers.</p>
                                    <p>If We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a parent, We may require Your parent's consent before We collect and use that information.</p>

                                    <br/>
                                    <h3>Links to Other Websites</h3>
                                    <p>Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.</p>
                                    <p>We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.</p>

                                    <br/>
                                    <h3>Changes to this Privacy Policy</h3>
                                    <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>
                                    <p>We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.</p>
                                    <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

                                    <br/>
                                    <h3>Contact Us</h3>
                                    <p>If you have any questions about this Privacy Policy, You can contact us:</p>
                                    <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                                        <li>By email: it.headoffice@binasaranasukses.com</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                html, body {
                    background-color: #df2128;
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                }

                .login-wrapper {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #df2128;
                    background-image: url('/bg-login.svg');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    font-family: 'Inter', sans-serif;
                    position: relative;
                    padding: 24px;
                }
                
                .brand-logo {
                    position: absolute;
                    top: 30px;
                    left: 40px;
                }
                
                .brand-logo img {
                    height: 50px;
                    object-fit: contain;
                }
                
                .login-card {
                    background: #ffffff;
                    border-radius: 8px;
                    padding: 40px 45px;
                    width: 100%;
                    max-width: 420px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    position: relative;
                    z-index: 10;
                }
                
                .card-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: #333333;
                    text-align: center;
                    margin-bottom: 25px;
                }
                
                .login-form {
                    display: flex;
                    flex-direction: column;
                }
                
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: 15px;
                }
                
                .form-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: #555555;
                }
                
                .form-input {
                    width: 100%;
                    padding: 10px 14px;
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 4px;
                    color: #333333;
                    font-size: 13px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                
                .form-input:focus {
                    border-color: #df2128;
                    background: #ffffff;
                }
                
                .error-msg {
                    font-size: 11px;
                    color: #df2128;
                    margin-top: 4px;
                }
                
                .form-row {
                    margin-bottom: 20px;
                    margin-top: 5px;
                }
                
                .remember-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }
                
                .remember-checkbox {
                    width: 14px;
                    height: 14px;
                    cursor: pointer;
                    accent-color: #df2128;
                    border-radius: 3px;
                    border: 1px solid #ccc;
                }
                
                .remember-text {
                    font-size: 12px;
                    color: #555555;
                }
                
                .submit-btn {
                    width: 100%;
                    padding: 12px;
                    background: #d41a21;
                    border: none;
                    border-radius: 4px;
                    color: white;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                
                .submit-btn:hover:not(:disabled) {
                    background: #b5151b;
                }
                
                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                .text-right {
                    text-align: right;
                }
                
                .text-center {
                    text-align: center;
                }
                
                .mt-2 {
                    margin-top: 8px;
                }
                
                .mt-6 {
                    margin-top: 25px;
                }
                
                .forgot-link, .privacy-link {
                    font-size: 11px;
                    color: #df2128;
                    text-decoration: none;
                }
                
                .forgot-link:hover, .privacy-link:hover {
                    text-decoration: underline;
                }
                
                .alert-success {
                    color: #15803d;
                    background: #dcfce7;
                    padding: 10px;
                    border-radius: 6px;
                    font-size: 12px;
                    margin-bottom: 20px;
                    text-align: center;
                }
                
                /* Modal Styles */
                .privacy-modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                    padding: 20px;
                }
                
                .privacy-modal-content {
                    background: #fff;
                    border-radius: 8px;
                    width: 80vw;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                }
                
                .privacy-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    border-bottom: 1px solid #f1f5f9;
                }
                
                .privacy-modal-header h2 {
                    font-size: 18px;
                    color: #333;
                    margin: 0;
                }
                
                .close-btn {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #888;
                    cursor: pointer;
                    line-height: 1;
                }
                .close-btn:hover { color: #333; }
                
                .privacy-modal-body {
                    padding: 24px;
                    overflow-y: auto;
                    font-size: 14px;
                    color: #555;
                    line-height: 1.6;
                }
                .privacy-modal-body h3 {
                    margin-top: 15px;
                    margin-bottom: 8px;
                    font-size: 16px;
                    color: #333;
                }
                .privacy-modal-body h4 {
                    margin-top: 10px;
                    margin-bottom: 6px;
                    font-size: 15px;
                    color: #444;
                }
                .privacy-modal-body h5 {
                    margin-top: 10px;
                    margin-bottom: 6px;
                    font-size: 14px;
                    color: #555;
                }
                .privacy-modal-body p {
                    margin-bottom: 8px;
                }
            `}</style>
        </>
    );
}
